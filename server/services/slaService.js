const {
  SLA_HOURS,
  SLA_AT_RISK_FRACTION,
  SLA_STATES,
  ACTIVE_STATUSES,
  FINISHED_STATUSES,
  PRIORITIES,
} = require('../utils/constants');

const MIN_MS = 60 * 1000;
const HOUR_MS = 60 * MIN_MS;

function computeSlaDueAt(priority, startedAt) {
  return new Date(new Date(startedAt).getTime() + SLA_HOURS[priority] * HOUR_MS);
}

function formatAge(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

// SLA state is calculated on the server from the stored slaDueAt.
function getSlaInfo(ticket, now = new Date()) {
  const dueAt = new Date(ticket.slaDueAt);

  if (FINISHED_STATUSES.includes(ticket.status)) {
    const doneAt = new Date(ticket.resolvedAt || ticket.closedAt || ticket.updatedAt);
    return {
      state: doneAt <= dueAt ? SLA_STATES.MET : SLA_STATES.BREACHED,
      dueAt,
      remainingMinutes: null,
      isOverdue: false,
    };
  }

  const remainingMs = dueAt.getTime() - now.getTime();
  const windowMs = SLA_HOURS[ticket.priority] * HOUR_MS;

  let state = SLA_STATES.ON_TRACK;
  if (remainingMs <= 0) state = SLA_STATES.BREACHED;
  else if (remainingMs <= windowMs * SLA_AT_RISK_FRACTION) state = SLA_STATES.AT_RISK;

  return {
    state,
    dueAt,
    remainingMinutes: Math.trunc(remainingMs / MIN_MS), // negative when overdue
    isOverdue: remainingMs <= 0,
  };
}

function getAgeMinutes(ticket, now = new Date()) {
  const finished = FINISHED_STATUSES.includes(ticket.status);
  const end = finished ? new Date(ticket.resolvedAt || ticket.closedAt || now) : now;
  return Math.max(0, Math.floor((end.getTime() - new Date(ticket.createdAt).getTime()) / MIN_MS));
}

// Adds computed sla + ageing fields to a plain ticket object.
function decorateTicket(ticket, now = new Date()) {
  const ageMinutes = getAgeMinutes(ticket, now);
  return {
    ...ticket,
    sla: getSlaInfo(ticket, now),
    ageing: { minutes: ageMinutes, label: formatAge(ageMinutes) },
  };
}

// MongoDB filter matching getSlaInfo for ACTIVE tickets (used by list filters).
function buildSlaFilter(state, now = new Date()) {
  const active = { status: { $in: ACTIVE_STATUSES } };

  if (state === SLA_STATES.BREACHED) {
    return { ...active, slaDueAt: { $lte: now } };
  }

  const perPriority = (build) => PRIORITIES.map((p) => ({ priority: p, ...build(p) }));
  const riskLimit = (p) => new Date(now.getTime() + SLA_HOURS[p] * HOUR_MS * SLA_AT_RISK_FRACTION);

  if (state === SLA_STATES.AT_RISK) {
    return {
      ...active,
      $or: perPriority((p) => ({ slaDueAt: { $gt: now, $lte: riskLimit(p) } })),
    };
  }

  // ON_TRACK
  return {
    ...active,
    $or: perPriority((p) => ({ slaDueAt: { $gt: riskLimit(p) } })),
  };
}

module.exports = { computeSlaDueAt, getSlaInfo, getAgeMinutes, decorateTicket, buildSlaFilter };