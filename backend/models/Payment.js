// Payment model - MongoDB schema for payment records
// Tracks Stripe payments, subscriptions, and payouts

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['subscription', 'one_time', 'payout'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'PKR']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  // Stripe data
  stripePaymentIntentId: String,
  stripeChargeId: String,
  stripeInvoiceId: String,
  stripeSubscriptionId: String,
  stripeCustomerId: String,
  // Plan information
  plan: {
    type: String,
    enum: ['free', 'pro', 'business', 'enterprise']
  },
  billingPeriod: {
    start: Date,
    end: Date
  },
  // Metadata
  description: String,
  metadata: mongoose.Schema.Types.Mixed,
  // Payout information (if applicable)
  payoutAccount: {
    provider: String,
    accountId: String
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);

