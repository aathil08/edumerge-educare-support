const mongoose = require('mongoose');
const { ROLES, ROLE_VALUES } = require('../utils/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters.'],
      maxlength: [60, 'Name must be at most 60 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, 'Email is too long.'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never returned by default queries
    },
    role: {
      type: String,
      enum: { values: ROLE_VALUES, message: 'Invalid role.' },
      default: ROLES.STUDENT,
    },
    department: {
      type: String,
      trim: true,
      maxlength: [80, 'Department must be at most 80 characters.'],
      default: '',
    },
  },
  { timestamps: true }
);

// Never leak the password hash in JSON responses.
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);