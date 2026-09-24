const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');
const { validateRegisterInput, validateLoginInput } = require('../utils/validation');

const register = asyncHandler(async (req, res) => {
  const input = validateRegisterInput(req.body);
  const { user, token } = await authService.register(input);
  res.status(201).json({ success: true, data: { user, token } });
});

const login = asyncHandler(async (req, res) => {
  const input = validateLoginInput(req.body);
  const { user, token } = await authService.login(input);
  res.status(200).json({ success: true, data: { user, token } });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
});

module.exports = { register, login, me };