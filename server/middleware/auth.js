const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Verifies the JWT and attaches the current user to req.user.
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Authentication required. Please log in.');
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Your session has expired. Please log in again.');
    }
    throw new ApiError(401, 'Invalid authentication token. Please log in again.');
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new ApiError(401, 'This account no longer exists. Please log in again.');
  }

  req.user = user;
  next();
});

// Allows only the listed roles. Must be used AFTER protect.
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required. Please log in.'));
  }
  if (!allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to perform this action.'));
  }
  next();
};

module.exports = { protect, authorize };