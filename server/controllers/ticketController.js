const asyncHandler = require('../utils/asyncHandler');
const ticketService = require('../services/ticketService');
const {
  validateCreateTicket,
  validatePriorityInput,
  validateStatusInput,
  validateAssignInput,
  parseListQuery,
} = require('../utils/ticketValidation');

const create = asyncHandler(async (req, res) => {
  const input = validateCreateTicket(req.body);
  const ticket = await ticketService.createTicket(req.user, input);
  res.status(201).json({ success: true, data: { ticket } });
});

const list = asyncHandler(async (req, res) => {
  const query = parseListQuery(req.query);
  const data = await ticketService.listTickets(req.user, query);
  res.status(200).json({ success: true, data });
});

const getOne = asyncHandler(async (req, res) => {
  const ticket = await ticketService.getTicket(req.user, req.params.id);
  res.status(200).json({ success: true, data: { ticket } });
});

const updatePriority = asyncHandler(async (req, res) => {
  const { priority } = validatePriorityInput(req.body);
  const ticket = await ticketService.updatePriority(req.user, req.params.id, priority);
  res.status(200).json({ success: true, data: { ticket } });
});

const changeStatus = asyncHandler(async (req, res) => {
  const input = validateStatusInput(req.body);
  const ticket = await ticketService.changeStatus(req.user, req.params.id, input);
  res.status(200).json({ success: true, data: { ticket } });
});

const assign = asyncHandler(async (req, res) => {
  const { assignedTo } = validateAssignInput(req.body);
  const ticket = await ticketService.assignTicket(req.user, req.params.id, assignedTo);
  res.status(200).json({ success: true, data: { ticket } });
});

module.exports = { create, list, getOne, updatePriority, changeStatus, assign };