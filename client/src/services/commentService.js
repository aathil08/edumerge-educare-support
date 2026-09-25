import api from './api.js';

export async function listComments(ticketId) {
  const res = await api.get(`/tickets/${ticketId}/comments`);
  return res.data.data.comments;
}

export async function addComment(ticketId, payload) {
  const res = await api.post(`/tickets/${ticketId}/comments`, payload);
  return res.data.data.comment;
}

export async function listActivity(ticketId) {
  const res = await api.get(`/tickets/${ticketId}/activity`);
  return res.data.data.activities;
}