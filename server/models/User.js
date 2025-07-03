const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  scripts_generated_count: {
    type: Number,
    default: 0
  },
  subscription_plan: {
    type: String,
    enum: ['free', 'monthly', 'per-script'],
    default: 'free'
  },
  credits: {
    type: Number,
    default: 0
  },
  stripeCustomerId: {
    type: String,
    sparse: true
  },
  stripeSubscriptionId: {
    type: String,
    sparse: true
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'unpaid', 'incomplete']
  },
  subscriptionEndDate: {
    type: Date,
    default: null
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Only use schema.index() method to avoid duplicate index warnings
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);