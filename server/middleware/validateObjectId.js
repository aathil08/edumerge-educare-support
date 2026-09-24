const ApiError = require('../utils/ApiError');

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

// Rejects malformed ids (like "abc") before they reach the database.
const validateObjectIdParam = (paramName = 'id', label = 'ticket ID') => (req, res, next) => {
  if (!OBJECT_ID_REGEX.test(req.params[paramName] || '')) {
    return next(new ApiError(400, `Invalid ${label}.`));
  }
  next();
};

module.exports = validateObjectIdParam;