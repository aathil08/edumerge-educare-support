const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { ROLES } = require('../utils/constants');

const SALT_ROUNDS = 10;

function signToken(user) {
  // Only the user id goes in the token. Role is always read from the database.
  return jwt.sign({}, env.jwtSecret, {
    subject: String(user._id),
    expiresIn: env.jwtExpiresIn,
  });
}

async function register({ name, email, password, department }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Role is forced to STUDENT. Public registration can never create staff/managers.
  const user = await User.create({
    name,
    email,
    passwordHash,
    department,
    role: ROLES.STUDENT,
  });

  return { user, token: signToken(user) };
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');
  const isValid = user ? await bcrypt.compare(password, user.passwordHash) : false;

  // Same message for unknown email and wrong password.
  if (!isValid) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  return { user, token: signToken(user) };
}

module.exports = { register, login, signToken };