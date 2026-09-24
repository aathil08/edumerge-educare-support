const express = require('express');
const { register, login, me } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, me);

// TEMPORARY: used only to verify role protection. Will be removed in Chunk C.
router.get('/manager-only', protect, authorize(ROLES.MANAGER), (req, res) => {
  res.json({ success: true, data: { message: 'Manager access confirmed.' } });
});

module.exports = router;