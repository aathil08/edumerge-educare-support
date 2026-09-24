const express = require('express');
const controller = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/auth');
const validateObjectIdParam = require('../middleware/validateObjectId');
const { ROLES } = require('../utils/constants');

const router = express.Router();
const idCheck = validateObjectIdParam('id', 'ticket ID');

router.use(protect);

router.post('/', authorize(ROLES.STUDENT), controller.create);
router.get('/', controller.list);
router.get('/:id', idCheck, controller.getOne);
router.patch('/:id', idCheck, authorize(ROLES.STAFF, ROLES.MANAGER), controller.updatePriority);
router.patch('/:id/status', idCheck, controller.changeStatus);
router.patch('/:id/assign', idCheck, authorize(ROLES.STAFF, ROLES.MANAGER), controller.assign);

module.exports = router;