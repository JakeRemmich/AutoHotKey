const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  interval: {
    type: String,
    required: true,
    enum: ['month', 'year', 'one_time'],
    default: 'month'
  },
  currency: {
    type: String,
    required: true,
    default: 'usd'
  },
  features: [{
    type: String,
    required: true
  }],
  stripePriceId: {
    type: String,
    required: true,
    unique: true
  },
  stripeProductId: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  planType: {
    type: String,
    required: true,
    enum: ['monthly', 'per-script'],
    default: 'monthly'
  },
  salePrice: {
    type: Number,
    default: null
  },
  onSale: {
    type: Boolean,
    default: false
  },
  saleStartDate: {
    type: Date,
    default: null
  },
  saleEndDate: {
    type: Date,
    default: null
  }

}, {
  timestamps: true
});

// Only use schema.index() method to avoid duplicate index warnings
subscriptionPlanSchema.index({ stripePriceId: 1 });
subscriptionPlanSchema.index({ isActive: 1 });

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);