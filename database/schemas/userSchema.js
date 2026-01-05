// User database schema definition
// MongoDB/Supabase schema structure for users collection/table

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    index: true
  },
  company: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    default: 'US',
    index: true
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'PKR', 'GBP']
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'business', 'enterprise'],
      default: 'free',
      index: true
    },
    status: {
      type: String,
      enum: ['active', 'trialing', 'past_due', 'canceled', 'incomplete'],
      default: 'active',
      index: true
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    stripePriceId: String,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    trialEnd: Date,
    cancelAtPeriodEnd: { type: Boolean, default: false }
  },
  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      alerts: { type: Boolean, default: true }
    },
    preferences: {
      theme: { type: String, default: 'light' },
      language: { type: String, default: 'en' }
    }
  },
  payoutAccount: {
    provider: {
      type: String,
      enum: ['stripe', 'payoneer', 'bank'],
      default: null
    },
    accountId: String,
    metadata: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'subscription.plan': 1, 'subscription.status': 1 });

module.exports = userSchema;
