import api from './api.js';

export async function listStaff() {
  const res = await api.get('/users/staff');
  return res.data.data.staff;
}