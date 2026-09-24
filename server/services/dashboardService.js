const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { decorateTicket } = require('./slaService');
const {
  ROLES,
  STATUSES,
  STATUS_VALUES,
  ACTIVE_STATUSES,
  FINISHED_STATUSES,
  CATEGORIES,
  PRIORITIES,
  PRIORITY_RANK,
  SLA_STATES,
} = require('../utils/constants');

const POPULATE = [
  { path: 'student', select: 'name email department' },
  { path: 'assignedTo', select: 'name email department' },
];

// Prototype-scale safety cap. At real scale this would move to MongoDB aggregation.
const MAX_TICKETS = 5000;

async function fetchDecorated(filter, now) {
  const tickets = await Ticket.find(filter)
    .sort({ createdAt: -1 })
    .limit(MAX_TICKETS)
    .populate(POPULATE)
    .lean();
  return tickets.map((t) => decorateTicket(t, now));
}

const isActive = (t) => ACTIVE_STATUSES.includes(t.status);
const isFinished = (t) => FINISHED_STATUSES.includes(t.status);
const isOverdue = (t) => isActive(t) && t.sla.isOverdue;
const isAtRisk = (t) => isActive(t) && t.sla.state === SLA_STATES.AT_RISK;

const countStatus = (tickets, ...statuses) =>
  tickets.filter((t) => statuses.includes(t.status)).length;

const byDue = (a, b) => new Date(a.slaDueAt) - new Date(b.slaDueAt);
const byPriorityThenDue = (a, b) =>
  PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || byDue(a, b);

const countBy = (tickets, field, values) =>
  values.map((value) => ({
    label: value,
    count: tickets.filter((t) => t[field] === value).length,
  }));

const AGEING_BUCKETS = [
  { label: 'Under 4 hours', max: 4 * 60 },
  { label: '4 to 24 hours', max: 24 * 60 },
  { label: '1 to 3 days', max: 3 * 24 * 60 },
  { label: '3 to 7 days', max: 7 * 24 * 60 },
  { label: 'Over 7 days', max: Infinity },
];

function ageingDistribution(activeTickets) {
  const result = AGEING_BUCKETS.map((b) => ({ label: b.label, count: 0 }));
  activeTickets.forEach((t) => {
    const index = AGEING_BUCKETS.findIndex((b) => t.ageing.minutes < b.max);
    result[index].count += 1;
  });
  return result;
}

async function getStudentDashboard(user) {
  const now = new Date();
  const tickets = await fetchDecorated({ student: user._id }, now); // newest first

  return {
    counts: {
      total: tickets.length,
      open: countStatus(tickets, STATUSES.OPEN, STATUSES.REOPENED),
      inProgress: countStatus(tickets, STATUSES.IN_PROGRESS, STATUSES.WAITING_FOR_STUDENT),
      resolvedClosed: countStatus(tickets, STATUSES.RESOLVED, STATUSES.CLOSED),
      waitingForStudent: countStatus(tickets, STATUSES.WAITING_FOR_STUDENT),
    },
    recentTickets: tickets.slice(0, 5),
    pendingTickets: tickets
      .filter((t) => t.status === STATUSES.WAITING_FOR_STUDENT)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5),
  };
}

async function getStaffDashboard(user) {
  const now = new Date();
  const mine = await fetchDecorated({ assignedTo: user._id }, now);
  const active = mine.filter(isActive);

  const [unassigned, recentActivity] = await Promise.all([
    Ticket.countDocuments({ assignedTo: null, status: { $in: ACTIVE_STATUSES } }),
    mine.length > 0
      ? Activity.find({ ticket: { $in: mine.map((t) => t._id) } })
          .sort({ createdAt: -1 })
          .limit(8)
          .populate('actor', 'name role')
          .populate('ticket', 'ticketNumber subject')
          .lean()
      : Promise.resolve([]),
  ]);

  return {
    counts: {
      assignedToMe: active.length,
      open: countStatus(active, STATUSES.OPEN, STATUSES.REOPENED),
      inProgress: countStatus(active, STATUSES.IN_PROGRESS, STATUSES.WAITING_FOR_STUDENT),
      slaRisk: active.filter(isAtRisk).length,
      overdue: active.filter(isOverdue).length,
      resolved: mine.filter(isFinished).length,
      unassigned,
    },
    myQueue: [...active].sort(byPriorityThenDue).slice(0, 8),
    slaRiskTickets: active.filter(isAtRisk).sort(byDue).slice(0, 5),
    overdueTickets: active.filter(isOverdue).sort(byDue).slice(0, 5),
    recentActivity,
  };
}

async function getManagerDashboard() {
  const now = new Date();
  const all = await fetchDecorated({}, now);
  const active = all.filter(isActive);

  const staffUsers = await User.find({ role: ROLES.STAFF })
    .select('name email department')
    .sort({ name: 1 })
    .lean();

  const staffWorkload = staffUsers
    .map((staff) => {
      const own = all.filter((t) => t.assignedTo && String(t.assignedTo._id) === String(staff._id));
      const ownActive = own.filter(isActive);
      return {
        staff,
        active: ownActive.length,
        inProgress: countStatus(ownActive, STATUSES.IN_PROGRESS),
        atRisk: ownActive.filter(isAtRisk).length,
        overdue: ownActive.filter(isOverdue).length,
        resolved: own.filter(isFinished).length,
      };
    })
    .sort((a, b) => b.active - a.active);

  return {
    counts: {
      total: all.length,
      open: countStatus(all, STATUSES.OPEN, STATUSES.REOPENED),
      inProgress: countStatus(all, STATUSES.IN_PROGRESS),
      waitingForStudent: countStatus(all, STATUSES.WAITING_FOR_STUDENT),
      slaRisk: active.filter(isAtRisk).length,
      overdue: active.filter(isOverdue).length,
      resolved: countStatus(all, STATUSES.RESOLVED, STATUSES.CLOSED),
      unassigned: active.filter((t) => !t.assignedTo).length,
    },
    analytics: {
      byCategory: countBy(all, 'category', CATEGORIES),
      byPriority: countBy(all, 'priority', PRIORITIES),
      byStatus: countBy(all, 'status', STATUS_VALUES),
      ageing: ageingDistribution(active),
    },
    staffWorkload,
    attentionTickets: active.filter(isOverdue).sort(byDue).slice(0, 5),
  };
}

module.exports = { getStudentDashboard, getStaffDashboard, getManagerDashboard };