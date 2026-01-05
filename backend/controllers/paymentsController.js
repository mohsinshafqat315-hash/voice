// Payments controller - handles Stripe payments and subscriptions
// Create checkout sessions, manage subscriptions

const User = require('../models/User');
const Payment = require('../models/Payment');
const { createCheckoutSession, createPortalSession, PLANS } = require('../utils/stripe');
const AuditLog = require('../models/AuditLog');

/**
 * Create Stripe Checkout session
 * POST /api/payments/create-checkout
 */
async function createCheckout(req, res) {
  try {
    const { plan } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!PLANS[plan]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan selected'
      });
    }
    
    // Check if user already has active subscription
    if (user.subscription.status === 'active' && user.subscription.plan !== 'free') {
      return res.status(400).json({
        success: false,
        error: 'You already have an active subscription. Please manage it from settings.'
      });
    }
    
    // Create checkout session
    const session = await createCheckoutSession({
      userId: user._id,
      plan,
      email: user.email,
      trialDays: 14
    });
    
    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Create customer portal session
 * POST /api/payments/create-portal
 */
async function createPortal(req, res) {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.subscription.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        error: 'No active subscription found'
      });
    }
    
    const session = await createPortalSession(user.subscription.stripeCustomerId);
    
    res.json({
      success: true,
      url: session.url
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get user's payment history
 * GET /api/payments/history
 */
async function getPaymentHistory(req, res) {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get available plans
 * GET /api/payments/plans
 */
async function getPlans(req, res) {
  try {
    res.json({
      success: true,
      plans: PLANS
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  createCheckout,
  createPortal,
  getPaymentHistory,
  getPlans
};

