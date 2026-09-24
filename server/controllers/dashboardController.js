const asyncHandler = require('../utils/asyncHandler');
const dashboardService = require('../services/dashboardService');

const student = asyncHandler(async (req, res) => {
  const data = await dashboardService.getStudentDashboard(req.user);
  res.status(200).json({ success: true, data });
});

const staff = asyncHandler(async (req, res) => {
  const data = await dashboardService.getStaffDashboard(req.user);
  res.status(200).json({ success: true, data });
});

const manager = asyncHandler(async (req, res) => {
  const data = await dashboardService.getManagerDashboard();
  res.status(200).json({ success: true, data });
});

module.exports = { student, staff, manager };