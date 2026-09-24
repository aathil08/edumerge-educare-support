const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const { ROLES } = require('../utils/constants');

// Staff list, used for assignment dropdowns.
const listStaff = asyncHandler(async (req, res) => {
  const staff = await User.find({ role: ROLES.STAFF })
    .select('name email department')
    .sort({ name: 1 })
    .lean();
  res.status(200).json({ success: true, data: { staff } });
});

module.exports = { listStaff };