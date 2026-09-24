const express = require('express');
const { listStaff } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.get('/staff', protect, authorize(ROLES.STAFF, ROLES.MANAGER), listStaff);

module.exports = router;