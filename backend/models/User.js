// User model - MongoDB schema for users
// Fields: email, password, name, role, company, settings, subscription, createdAt

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  company: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    default: 'US'
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'PKR']
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'business', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'trialing', 'past_due', 'canceled', 'incomplete'],
      default: 'active'
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    stripePriceId: String,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    trialEnd: Date,
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    }
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user has active subscription
userSchema.methods.hasActiveSubscription = function() {
  return this.subscription.status === 'active' || 
         this.subscription.status === 'trialing';
};

// Check subscription limits
userSchema.methods.getReceiptLimit = function() {
  const limits = {
    free: 10,
    pro: 100,
    business: 1000,
    enterprise: -1 // unlimited
  };
  return limits[this.subscription.plan] || 10;
};

module.exports = mongoose.model('User', userSchema);
