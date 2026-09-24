import api from './api.js';

export async function getStudentDashboard() {
  const res = await api.get('/dashboard/student');
  return res.data.data;
}

export async function getStaffDashboard() {
  const res = await api.get('/dashboard/staff');
  return res.data.data;
}

export async function getManagerDashboard() {
  const res = await api.get('/dashboard/manager');
  return res.data.data;
}