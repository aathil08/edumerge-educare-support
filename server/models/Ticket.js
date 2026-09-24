const mongoose = require('mongoose');
const {
  CATEGORIES,
  PRIORITIES,
  PRIORITY_RANK,
  DEFAULT_PRIORITY,
  STATUS_VALUES,
  STATUSES,
} = require('../utils/constants');

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, required: true, unique: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      required: [true, 'Category is required.'],
      enum: { values: CATEGORIES, message: 'Invalid category.' },
    },
    subject: {
      type: String,
      required: [true, 'Subject is required.'],
      trim: true,
      minlength: [3, 'Subject must be at least 3 characters.'],
      maxlength: [120, 'Subject must be at most 120 characters.'],
    },
    description: {
      type: String,
      required: [true, 'Description is required.'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters.'],
      maxlength: [2000, 'Description must be at most 2000 characters.'],
    },
    priority: {
      type: String,
      enum: { values: PRIORITIES, message: 'Invalid priority.' },
      default: DEFAULT_PRIORITY,
    },
    priorityRank: { type: Number, default: PRIORITY_RANK[DEFAULT_PRIORITY] }, // for sorting
    status: {
      type: String,
      enum: { values: STATUS_VALUES, message: 'Invalid status.' },
      default: STATUSES.OPEN,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    slaStartedAt: { type: Date, required: true },
    slaDueAt: { type: Date, required: true },
    resolvedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
    reopenedAt: { type: Date, default: null },
    resolutionSummary: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { timestamps: true }
);

// Keep priorityRank in sync with priority.
ticketSchema.pre('validate', async function () {
  this.priorityRank = PRIORITY_RANK[this.priority] || PRIORITY_RANK[DEFAULT_PRIORITY];
});

ticketSchema.index({ student: 1, createdAt: -1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ status: 1, slaDueAt: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);