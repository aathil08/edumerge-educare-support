const express = require('express');
const controller = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(protect);

router.get('/student', authorize(ROLES.STUDENT), controller.student);
router.get('/staff', authorize(ROLES.STAFF), controller.staff);
router.get('/manager', authorize(ROLES.MANAGER), controller.manager);

module.exports = router;