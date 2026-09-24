const ApiError = require('./ApiError');
const {
  CATEGORIES,
  PRIORITIES,
  STATUS_VALUES,
  STATUSES,
  SLA_FILTER_VALUES,
  SORT_OPTIONS,
} = require('./constants');

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

const str = (v) => (typeof v === 'string' ? v : '');

function throwIfErrors(errors) {
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors);
}

function validateCreateTicket(body) {
  const b = body || {};
  const errors = [];

  const category = str(b.category).trim();
  const subject = str(b.subject).trim();
  const description = str(b.description).trim();

  if (!category) errors.push({ field: 'category', message: 'Category is required.' });
  else if (!CATEGORIES.includes(category))
    errors.push({ field: 'category', message: `Category must be one of: ${CATEGORIES.join(', ')}.` });

  if (!subject) errors.push({ field: 'subject', message: 'Subject is required.' });
  else if (subject.length < 3 || subject.length > 120)
    errors.push({ field: 'subject', message: 'Subject must be 3 to 120 characters.' });

  if (!description) errors.push({ field: 'description', message: 'Description is required.' });
  else if (description.length < 10 || description.length > 2000)
    errors.push({ field: 'description', message: 'Description must be 10 to 2000 characters.' });

  throwIfErrors(errors);
  return { category, subject, description };
}

function validatePriorityInput(body) {
  const priority = str((body || {}).priority).trim().toUpperCase();
  if (!priority) throwIfErrors([{ field: 'priority', message: 'Priority is required.' }]);
  if (!PRIORITIES.includes(priority))
    throwIfErrors([{ field: 'priority', message: `Priority must be one of: ${PRIORITIES.join(', ')}.` }]);
  return { priority };
}

function validateStatusInput(body) {
  const b = body || {};
  const errors = [];
  const status = str(b.status).trim().toUpperCase();
  const resolutionSummary = str(b.resolutionSummary).trim();

  if (!status) errors.push({ field: 'status', message: 'Status is required.' });
  else if (!STATUS_VALUES.includes(status))
    errors.push({ field: 'status', message: `Status must be one of: ${STATUS_VALUES.join(', ')}.` });

  if (resolutionSummary.length > 1000)
    errors.push({ field: 'resolutionSummary', message: 'Resolution summary must be at most 1000 characters.' });

  if (status === STATUSES.RESOLVED && resolutionSummary.length < 5)
    errors.push({
      field: 'resolutionSummary',
      message: 'A resolution summary (at least 5 characters) is required to resolve a ticket.',
    });

  throwIfErrors(errors);
  return { status, resolutionSummary };
}

function validateAssignInput(body) {
  const assignedTo = str((body || {}).assignedTo).trim();
  if (!assignedTo) throwIfErrors([{ field: 'assignedTo', message: 'Staff member is required.' }]);
  if (!OBJECT_ID_REGEX.test(assignedTo))
    throwIfErrors([{ field: 'assignedTo', message: 'Invalid staff member ID.' }]);
  return { assignedTo };
}

function toInt(value, fallback) {
  const n = parseInt(str(value), 10);
  return Number.isNaN(n) ? fallback : n;
}

function parseListQuery(query) {
  const q = query || {};
  const errors = [];

  const page = Math.max(1, toInt(q.page, 1));
  const limit = Math.min(50, Math.max(1, toInt(q.limit, 10)));
  const search = str(q.search).trim().slice(0, 100);
  const category = str(q.category).trim();
  const priority = str(q.priority).trim().toUpperCase();
  const status = str(q.status).trim().toUpperCase();
  const assignedTo = str(q.assignedTo).trim();
  const sla = str(q.sla).trim().toUpperCase();
  const sort = str(q.sort).trim() || 'newest';

  if (category && !CATEGORIES.includes(category))
    errors.push({ field: 'category', message: 'Invalid category filter.' });
  if (priority && !PRIORITIES.includes(priority))
    errors.push({ field: 'priority', message: 'Invalid priority filter.' });
  if (status && !STATUS_VALUES.includes(status))
    errors.push({ field: 'status', message: 'Invalid status filter.' });
  if (sla && !SLA_FILTER_VALUES.includes(sla))
    errors.push({ field: 'sla', message: 'Invalid SLA filter.' });
  if (!SORT_OPTIONS.includes(sort))
    errors.push({ field: 'sort', message: `Sort must be one of: ${SORT_OPTIONS.join(', ')}.` });
  if (assignedTo && !['me', 'unassigned'].includes(assignedTo) && !OBJECT_ID_REGEX.test(assignedTo))
    errors.push({ field: 'assignedTo', message: 'Invalid assigned staff filter.' });

  throwIfErrors(errors);
  return { page, limit, search, category, priority, status, assignedTo, sla, sort };
}

module.exports = {
  validateCreateTicket,
  validatePriorityInput,
  validateStatusInput,
  validateAssignInput,
  parseListQuery,
};