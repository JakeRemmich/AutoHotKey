const mongoose = require('mongoose');

const scriptSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  script: {
    type: String,
    required: true
  },
  originalDescription: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying by user
scriptSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Script', scriptSchema);