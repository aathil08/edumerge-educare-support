const mongoose = require('mongoose');

// Used to generate sequential ticket numbers atomically (one document per year).
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

module.exports = mongoose.model('Counter', counterSchema);