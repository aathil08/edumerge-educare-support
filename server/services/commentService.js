const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const ApiError = require('../utils/ApiError');
const { logActivity } = require('./activityService');
const { ROLES, STATUSES, ACTIVITY_ACTIONS } = require('../utils/constants');
const { COMMENT_VISIBILITY } = require('../utils/commentConstants');

// Loads a ticket. Students only "see" their own tickets (others return 404).
async function loadTicketForUser(user, id) {
  const ticket = await Ticket.findById(id);
  if (
    !ticket ||
    (user.role === ROLES.STUDENT && String(ticket.student) !== String(user._id))
  ) {
    throw new ApiError(404, 'Ticket not found.');
  }
  return ticket;
}

function activityLabel(user, visibility) {
  if (visibility === COMMENT_VISIBILITY.INTERNAL) return 'Internal note added';
  if (user.role === ROLES.STUDENT) return 'Student response added';
  if (user.role === ROLES.MANAGER) return 'Manager response added';
  return 'Staff response added';
}

async function addComment(user, ticketId, { message, visibility }) {
  const ticket = await loadTicketForUser(user, ticketId);

  if (ticket.status === STATUSES.CLOSED) {
    throw new ApiError(409, 'This ticket is closed. Reopen it to add a response.');
  }

  if (user.role === ROLES.STUDENT && visibility === COMMENT_VISIBILITY.INTERNAL) {
    throw new ApiError(403, 'Students cannot add internal notes.');
  }

  if (user.role === ROLES.STAFF && ticket.assignedTo && String(ticket.assignedTo) !== String(user._id)) {
    throw new ApiError(403, 'Only assigned support staff can perform this action.');
  }

  const comment = await Comment.create({
    ticket: ticket._id,
    author: user._id,
    message,
    visibility,
  });

  // The activity entry never contains the comment text (keeps internal notes private).
  await logActivity({
    ticket: ticket._id,
    actor: user._id,
    action: ACTIVITY_ACTIONS.COMMENT_ADDED,
    message: activityLabel(user, visibility),
    metadata: { commentId: String(comment._id), visibility },
  });

  // Pending-action workflow: a student reply moves WAITING_FOR_STUDENT -> IN_PROGRESS.
  let statusChanged = false;
  if (user.role === ROLES.STUDENT && ticket.status === STATUSES.WAITING_FOR_STUDENT) {
    const updated = await Ticket.findOneAndUpdate(
      { _id: ticket._id, status: STATUSES.WAITING_FOR_STUDENT },
      { $set: { status: STATUSES.IN_PROGRESS } },
      { new: true }
    );
    if (updated) {
      statusChanged = true;
      await logActivity({
        ticket: ticket._id,
        actor: user._id,
        action: ACTIVITY_ACTIONS.STATUS_CHANGED,
        message: 'Status changed from WAITING_FOR_STUDENT to IN_PROGRESS (student replied)',
        metadata: {
          from: STATUSES.WAITING_FOR_STUDENT,
          to: STATUSES.IN_PROGRESS,
          auto: true,
        },
      });
    }
  }

  // Keep the ticket's "last updated" time accurate.
  if (!statusChanged) {
    await Ticket.updateOne(
      { _id: ticket._id },
      { $set: { updatedAt: new Date() } },
      { timestamps: false }
    );
  }

  return Comment.findById(comment._id).populate('author', 'name role').lean();
}

async function listComments(user, ticketId) {
  const ticket = await loadTicketForUser(user, ticketId);

  const filter = { ticket: ticket._id };
  if (user.role === ROLES.STUDENT) {
    filter.visibility = COMMENT_VISIBILITY.PUBLIC; // students never see internal notes
  }

  return Comment.find(filter)
    .sort({ createdAt: 1, _id: 1 })
    .populate('author', 'name role')
    .lean();
}

async function listActivity(user, ticketId) {
  const ticket = await loadTicketForUser(user, ticketId);

  const filter = { ticket: ticket._id };
  if (user.role === ROLES.STUDENT) {
    // Hide entries that relate to internal notes.
    filter['metadata.visibility'] = { $ne: COMMENT_VISIBILITY.INTERNAL };
  }

  return Activity.find(filter)
    .sort({ createdAt: 1, _id: 1 })
    .limit(200)
    .populate('actor', 'name role')
    .lean();
}

module.exports = { addComment, listComments, listActivity };