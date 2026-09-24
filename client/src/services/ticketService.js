import api from './api.js';

export async function createTicket(payload) {
  const res = await api.post('/tickets', payload);
  return res.data.data.ticket;
}

// Returns { tickets, pagination }
export async function listTickets(params) {
  const res = await api.get('/tickets', { params });
  return res.data.data;
}