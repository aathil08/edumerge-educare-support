const env = require('../config/env');
const ApiError = require('../utils/ApiError');

// Converts known library errors into ApiError so responses stay consistent.
function normalizeError(err) {
  if (err instanceof ApiError) return err;

  // Malformed JSON body
  if (err.type === 'entity.parse.failed') {
    return new ApiError(400, 'Invalid JSON in request body.');
  }

  // Body too large
  if (err.type === 'entity.too.large') {
    return new ApiError(413, 'Request body is too large.');
  }

  // Invalid MongoDB ObjectId (e.g. /api/tickets/abc)
  if (err.name === 'CastError') {
    return new ApiError(400, `Invalid value for "${err.path}".`);
  }

  // Mongoose schema validation failure
  if (err.name === 'ValidationError' && err.errors) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return new ApiError(400, 'Validation failed.', errors);
  }

  // Duplicate key (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return new ApiError(409, `A record with this ${field} already exists.`);
  }

  return null; // unknown error
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const normalized = normalizeError(err);

  if (normalized) {
    const body = { success: false, message: normalized.message };
    if (normalized.errors) body.errors = normalized.errors;
    return res.status(normalized.statusCode).json(body);
  }

  // Unknown error: log full details on the server, hide them from the client.
  console.error('[error] Unhandled error:', err);

  const body = {
    success: false,
    message: 'Something went wrong on our side. Please try again.',
  };
  if (!env.isProduction) body.debug = err.message;

  return res.status(500).json(body);
}

module.exports = errorHandler;