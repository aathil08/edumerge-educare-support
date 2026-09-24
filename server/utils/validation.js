const ApiError = require('./ApiError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(value) {
  return typeof value === 'string' ? value : '';
}

function throwIfErrors(errors) {
  if (errors.length > 0) {
    throw new ApiError(400, 'Validation failed.', errors);
  }
}

function validateRegisterInput(body) {
  const b = body || {};
  const errors = [];

  const name = str(b.name).trim();
  const email = str(b.email).trim().toLowerCase();
  const password = str(b.password);
  const department = str(b.department).trim();

  if (!name) errors.push({ field: 'name', message: 'Name is required.' });
  else if (name.length < 2 || name.length > 60)
    errors.push({ field: 'name', message: 'Name must be 2 to 60 characters.' });

  if (!email) errors.push({ field: 'email', message: 'Email is required.' });
  else if (email.length > 254 || !EMAIL_REGEX.test(email))
    errors.push({ field: 'email', message: 'Please enter a valid email address.' });

  if (!password) errors.push({ field: 'password', message: 'Password is required.' });
  else if (password.length < 8)
    errors.push({ field: 'password', message: 'Password must be at least 8 characters.' });
  else if (password.length > 72)
    errors.push({ field: 'password', message: 'Password must be at most 72 characters.' });

  if (department.length > 80)
    errors.push({ field: 'department', message: 'Department must be at most 80 characters.' });

  throwIfErrors(errors);
  return { name, email, password, department };
}

function validateLoginInput(body) {
  const b = body || {};
  const errors = [];

  const email = str(b.email).trim().toLowerCase();
  const password = str(b.password);

  if (!email) errors.push({ field: 'email', message: 'Email is required.' });
  if (!password) errors.push({ field: 'password', message: 'Password is required.' });

  throwIfErrors(errors);
  return { email, password };
}

module.exports = { validateRegisterInput, validateLoginInput };