const ApiError = require('./ApiError');
const {
  COMMENT_VISIBILITY,
  COMMENT_VISIBILITY_VALUES,
  MAX_COMMENT_LENGTH,
} = require('./commentConstants');

const str = (v) => (typeof v === 'string' ? v : '');

function validateCommentInput(body) {
  const b = body || {};
  const errors = [];

  const message = str(b.message).trim();
  const visibility = str(b.visibility).trim().toUpperCase() || COMMENT_VISIBILITY.PUBLIC;

  if (!message) {
    errors.push({ field: 'message', message: 'Message cannot be empty.' });
  } else if (message.length > MAX_COMMENT_LENGTH) {
    errors.push({
      field: 'message',
      message: `Message must be at most ${MAX_COMMENT_LENGTH} characters.`,
    });
  }

  if (!COMMENT_VISIBILITY_VALUES.includes(visibility)) {
    errors.push({
      field: 'visibility',
      message: `Visibility must be one of: ${COMMENT_VISIBILITY_VALUES.join(', ')}.`,
    });
  }

  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors);
  return { message, visibility };
}

module.exports = { validateCommentInput };