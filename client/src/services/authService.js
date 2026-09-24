import api from './api.js';

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password }, { skipAuthRedirect: true });
  return res.data.data; // { user, token }
}

export async function register(payload) {
  const res = await api.post('/auth/register', payload, { skipAuthRedirect: true });
  return res.data.data; // { user, token }
}

export async function getMe() {
  const res = await api.get('/auth/me');
  return res.data.data.user;
}