import api from './api.js';

export async function createTicket(payload) {
  const res = await api.post('/tickets', payload);
  return res.data.data.ticket;
}

export async function listTickets(params) {
  const res = await api.get('/tickets', { params });
  return res.data.data; // { tickets, pagination }
}

export async function getTicket(id) {
  const res = await api.get(`/tickets/${id}`);
  return res.data.data.ticket;
}

export async function updateTicketPriority(id, priority) {
  const res = await api.patch(`/tickets/${id}`, { priority });
  return res.data.data.ticket;
}

export async function changeTicketStatus(id, payload) {
  const res = await api.patch(`/tickets/${id}/status`, payload);
  return res.data.data.ticket;
}

export async function assignTicket(id, assignedTo) {
  const res = await api.patch(`/tickets/${id}/assign`, { assignedTo });
  return res.data.data.ticket;
}