const Ticket = require('../models/Ticket');
const Counter = require('../models/Counter');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { logActivity } = require('./activityService');
const { computeSlaDueAt, decorateTicket, buildSlaFilter } = require('./slaService');
const {
  ROLES,
  STATUSES,
  DEFAULT_PRIORITY,
  STATUS_TRANSITIONS,
  STUDENT_TRANSITIONS,
  STUDENT_REOPEN_WINDOW_DAYS,
  ACTIVITY_ACTIONS,
} = require('../utils/constants');

const POPULATE = [
  { path: 'student', select: 'name email department' },
  { path: 'assignedTo', select: 'name email department' },
];

const SORTS = {
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  priority: { priorityRank: 1, slaDueAt: 1, _id: 1 },
  sla_due: { slaDueAt: 1, _id: 1 },
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isAssignedTo = (ticket, user) =>
  Boolean(ticket.assignedTo) && String(ticket.assignedTo) === String(user._id);

async function generateTicketNumber(now = new Date()) {
  const year = now.getFullYear();
  const counter = await Counter.findOneAndUpdate(
    { _id: `ticket-${year}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `EDU-${year}-${String(counter.seq).padStart(5, '0')}`;
}

// Loads a ticket. Students only "see" their own tickets (others return 404).
async function findTicketOrThrow(user, id) {
  const ticket = await Ticket.findById(id);
  if (
    !ticket ||
    (user.role === ROLES.STUDENT && String(ticket.student) !== String(user._id))
  ) {
    throw new ApiError(404, 'Ticket not found.');
  }
  return ticket;
}

async function presentTicket(id) {
  const ticket = await Ticket.findById(id).populate(POPULATE).lean();
  return decorateTicket(ticket);
}

async function createTicket(student, { category, subject, description }) {
  // Duplicate-submit protection: identical ticket within the last 30 seconds.
  const recent = await Ticket.findOne({
    student: student._id,
    category,
    subject,
    description,
    createdAt: { $gte: new Date(Date.now() - 30 * 1000) },
  });
  if (recent) {
    throw new ApiError(409, 'This ticket was just submitted. Please check "My Tickets" before submitting again.');
  }

  const now = new Date();
  const ticketNumber = await generateTicketNumber(now);

  const ticket = await Ticket.create({
    ticketNumber,
    student: student._id,
    createdBy: student._id,
    category,
    subject,
    description,
    priority: DEFAULT_PRIORITY,
    status: STATUSES.OPEN,
    slaStartedAt: now,
    slaDueAt: computeSlaDueAt(DEFAULT_PRIORITY, now),
  });

  await logActivity({
    ticket: ticket._id,
    actor: student._id,
    action: ACTIVITY_ACTIONS.TICKET_CREATED,
    message: `Ticket ${ticketNumber} created`,
    metadata: { category, priority: DEFAULT_PRIORITY },
  });

  return presentTicket(ticket._id);
}

async function listTickets(user, query) {
  const now = new Date();
  const { page, limit, search, category, priority, status, assignedTo, sla, sort } = query;

  const filter = {};
  const and = [];

  if (user.role === ROLES.STUDENT) {
    filter.student = user._id; // students are always scoped to their own tickets
  } else if (assignedTo) {
    if (assignedTo === 'me') filter.assignedTo = user._id;
    else if (assignedTo === 'unassigned') filter.assignedTo = null;
    else filter.assignedTo = assignedTo;
  }

  if (category) filter.category = category;
  if (priority) filter.priority = priority;
  if (status) filter.status = status;
  if (sla) and.push(buildSlaFilter(sla, now));

  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    const or = [{ ticketNumber: rx }, { subject: rx }];
    if (user.role !== ROLES.STUDENT) {
      const students = await User.find({ role: ROLES.STUDENT, name: rx }).select('_id').limit(100).lean();
      if (students.length > 0) or.push({ student: { $in: students.map((s) => s._id) } });
    }
    and.push({ $or: or });
  }

  if (and.length > 0) filter.$and = and;

  const [total, items] = await Promise.all([
    Ticket.countDocuments(filter),
    Ticket.find(filter)
      .sort(SORTS[sort])
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(POPULATE)
      .lean(),
  ]);

  return {
    tickets: items.map((t) => decorateTicket(t, now)),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

async function getTicket(user, id) {
  const ticket = await findTicketOrThrow(user, id);
  return presentTicket(ticket._id);
}

async function changeStatus(user, id, { status: toStatus, resolutionSummary }) {
  const ticket = await findTicketOrThrow(user, id);
  const from = ticket.status;
  const now = new Date();

  if (from === toStatus) {
    throw new ApiError(400, 'The ticket is already in this status.');
  }

  const allowed = STATUS_TRANSITIONS[from] || [];
  if (!allowed.includes(toStatus)) {
    throw new ApiError(400, `Cannot change status from ${from} to ${toStatus}.`);
  }

  let claims = false;

  if (user.role === ROLES.STUDENT) {
    if (!STUDENT_TRANSITIONS.includes(`${from}>${toStatus}`)) {
      throw new ApiError(403, 'Students can only close resolved tickets or reopen them.');
    }
    if (from === STATUSES.CLOSED) {
      const windowMs = STUDENT_REOPEN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
      if (!ticket.closedAt || now.getTime() - ticket.closedAt.getTime() > windowMs) {
        throw new ApiError(
          403,
          `This ticket was closed more than ${STUDENT_REOPEN_WINDOW_DAYS} days ago. Please create a new ticket.`
        );
      }
    }
  } else if (user.role === ROLES.STAFF) {
    const mine = isAssignedTo(ticket, user);
    claims = !ticket.assignedTo && toStatus === STATUSES.IN_PROGRESS;
    if (!mine && !claims) {
      throw new ApiError(
        403,
        ticket.assignedTo
          ? 'Only assigned support staff can perform this action.'
          : 'Assign this ticket to yourself before changing its status.'
      );
    }
  }
  // MANAGER: may perform any valid transition.

  const set = { status: toStatus };
  let action = ACTIVITY_ACTIONS.STATUS_CHANGED;
  let message = `Status changed from ${from} to ${toStatus}`;
  const metadata = { from, to: toStatus };

  if (claims) {
    set.assignedTo = user._id;
    metadata.claimedBy = user._id;
  }

  if (toStatus === STATUSES.RESOLVED) {
    set.resolvedAt = now;
    set.resolutionSummary = resolutionSummary;
    action = ACTIVITY_ACTIONS.TICKET_RESOLVED;
    message = 'Ticket resolved';
    metadata.resolutionSummary = resolutionSummary;
  } else if (toStatus === STATUSES.CLOSED) {
    set.closedAt = now;
    action = ACTIVITY_ACTIONS.TICKET_CLOSED;
    message = 'Ticket closed';
  } else if (toStatus === STATUSES.REOPENED) {
    set.reopenedAt = now;
    set.resolvedAt = null;
    set.closedAt = null;
    set.slaStartedAt = now; // SLA restarts on reopen
    set.slaDueAt = computeSlaDueAt(ticket.priority, now);
    action = ACTIVITY_ACTIONS.TICKET_REOPENED;
    message = 'Ticket reopened';
  } else if (from === STATUSES.RESOLVED && toStatus === STATUSES.IN_PROGRESS) {
    set.resolvedAt = null;
    set.slaStartedAt = now; // SLA restarts when a resolved ticket is pushed back
    set.slaDueAt = computeSlaDueAt(ticket.priority, now);
    message = 'Ticket moved back to IN_PROGRESS (student not satisfied)';
  }

  // Conditional update: succeeds only if the status is still what we read.
  const updated = await Ticket.findOneAndUpdate(
    { _id: ticket._id, status: from },
    { $set: set },
    { new: true }
  );
  if (!updated) {
    throw new ApiError(409, 'This ticket was just updated by someone else. Please refresh and try again.');
  }

  await logActivity({ ticket: ticket._id, actor: user._id, action, message, metadata });
  return presentTicket(ticket._id);
}

async function assignTicket(user, id, assigneeId) {
  const ticket = await findTicketOrThrow(user, id);

  if (ticket.status === STATUSES.CLOSED) {
    throw new ApiError(409, 'Closed tickets cannot be reassigned. Reopen the ticket first.');
  }

  const assignee = await User.findById(assigneeId);
  if (!assignee || assignee.role !== ROLES.STAFF) {
    throw new ApiError(400, 'The assigned user must be an existing support staff member.');
  }

  const currentId = ticket.assignedTo ? String(ticket.assignedTo) : null;

  if (user.role === ROLES.STAFF) {
    if (currentId === null) {
      if (String(assignee._id) !== String(user._id)) {
        throw new ApiError(403, 'You can only assign an unassigned ticket to yourself.');
      }
    } else if (currentId !== String(user._id)) {
      throw new ApiError(403, 'Only the assigned support staff or a manager can reassign this ticket.');
    }
  }

  if (currentId === String(assignee._id)) {
    throw new ApiError(400, 'This ticket is already assigned to that staff member.');
  }

  let previous = null;
  if (currentId) previous = await User.findById(currentId).select('name');

  ticket.assignedTo = assignee._id;
  await ticket.save();

  await logActivity({
    ticket: ticket._id,
    actor: user._id,
    action: previous ? ACTIVITY_ACTIONS.TICKET_REASSIGNED : ACTIVITY_ACTIONS.TICKET_ASSIGNED,
    message: previous
      ? `Reassigned from ${previous.name} to ${assignee.name}`
      : `Assigned to ${assignee.name}`,
    metadata: { from: currentId, to: String(assignee._id) },
  });

  return presentTicket(ticket._id);
}

async function updatePriority(user, id, priority) {
  const ticket = await findTicketOrThrow(user, id);

  if (ticket.status === STATUSES.CLOSED) {
    throw new ApiError(409, 'Priority cannot be changed on a closed ticket.');
  }
  if (user.role === ROLES.STAFF && ticket.assignedTo && !isAssignedTo(ticket, user)) {
    throw new ApiError(403, 'Only assigned support staff can perform this action.');
  }
  if (ticket.priority === priority) {
    throw new ApiError(400, 'The ticket already has this priority.');
  }

  const old = ticket.priority;
  ticket.priority = priority;
  // SLA due time is recalculated from the SLA start time using the new priority.
  ticket.slaDueAt = computeSlaDueAt(priority, ticket.slaStartedAt);
  await ticket.save();

  await logActivity({
    ticket: ticket._id,
    actor: user._id,
    action: ACTIVITY_ACTIONS.PRIORITY_CHANGED,
    message: `Priority changed from ${old} to ${priority}`,
    metadata: { from: old, to: priority, slaDueAt: ticket.slaDueAt },
  });

  return presentTicket(ticket._id);
}

module.exports = { createTicket, listTickets, getTicket, changeStatus, assignTicket, updatePriority };