const mongoose = require('mongoose');
const { ACTIVITY_ACTIONS } = require('../utils/constants');

const activitySchema = new mongoose.Schema(
  {
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      required: true,
      enum: Object.values(ACTIVITY_ACTIONS),
    },
    message: { type: String, default: '', maxlength: 500 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activitySchema.index({ ticket: 1, createdAt: 1 });

module.exports = mongoose.model('Activity', activitySchema);