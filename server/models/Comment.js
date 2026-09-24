const mongoose = require('mongoose');
const {
  COMMENT_VISIBILITY,
  COMMENT_VISIBILITY_VALUES,
  MAX_COMMENT_LENGTH,
} = require('../utils/commentConstants');

const commentSchema = new mongoose.Schema(
  {
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: {
      type: String,
      required: [true, 'Message is required.'],
      trim: true,
      minlength: [1, 'Message cannot be empty.'],
      maxlength: [MAX_COMMENT_LENGTH, `Message must be at most ${MAX_COMMENT_LENGTH} characters.`],
    },
    visibility: {
      type: String,
      enum: { values: COMMENT_VISIBILITY_VALUES, message: 'Invalid visibility.' },
      default: COMMENT_VISIBILITY.PUBLIC,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

commentSchema.index({ ticket: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', commentSchema);