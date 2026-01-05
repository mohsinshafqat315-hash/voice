// Stripe utility - create sessions, handle webhooks, manage subscriptions
// All Stripe operations centralized here

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Subscription plans configuration
const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    stripePriceId: null,
    features: ['10 receipts/month', 'Basic AI analysis', 'CSV export']
  },
  pro: {
    name: 'Pro',
    price: 15,
    stripePriceId: process.env.STRIPE_PRICE_PRO || 'price_pro_monthly',
    features: ['100 receipts/month', 'Advanced AI analysis', 'CSV & PDF export', 'Email support']
  },
  business: {
    name: 'Business',
    price: 29,
    stripePriceId: process.env.STRIPE_PRICE_BUSINESS || 'price_business_monthly',
    features: ['1000 receipts/month', 'Full AI analysis', 'All exports', 'Priority support', 'Team features']
  },
  enterprise: {
    name: 'Enterprise',
    price: 79,
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_monthly',
    features: ['Unlimited receipts', 'Custom AI rules', 'API access', 'Dedicated support', 'Custom integrations']
  }
};

/**
 * Create Stripe Checkout session
 * @param {Object} options - Session options
 * @returns {Promise<Object>} Checkout session
 */
async function createCheckoutSession(options) {
  const { userId, plan, email, trialDays = 14 } = options;
  
  if (!PLANS[plan] || !PLANS[plan].stripePriceId) {
    throw new Error(`Invalid plan: ${plan}`);
  }
  
  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    payment_method_types: ['card'],
    line_items: [
      {
        price: PLANS[plan].stripePriceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    subscription_data: {
      trial_period_days: trialDays,
      metadata: {
        userId: userId.toString()
      }
    },
    success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
    metadata: {
      userId: userId.toString(),
      plan: plan
    }
  });
  
  return session;
}

/**
 * Create customer portal session
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<Object>} Portal session
 */
async function createPortalSession(customerId) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.FRONTEND_URL}/settings`,
  });
  
  return session;
}

/**
 * Get subscription details
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Object>} Subscription details
 */
async function getSubscription(subscriptionId) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel subscription
 * @param {string} subscriptionId - Stripe subscription ID
 * @param {boolean} immediately - Cancel immediately or at period end
 * @returns {Promise<Object>} Updated subscription
 */
async function cancelSubscription(subscriptionId, immediately = false) {
  if (immediately) {
    return await stripe.subscriptions.cancel(subscriptionId);
  } else {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });
  }
}

/**
 * Update subscription
 * @param {string} subscriptionId - Stripe subscription ID
 * @param {string} newPriceId - New price ID
 * @returns {Promise<Object>} Updated subscription
 */
async function updateSubscription(subscriptionId, newPriceId) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [{
      id: subscription.items.data[0].id,
      price: newPriceId,
    }],
    proration_behavior: 'create_prorations'
  });
}

/**
 * Verify webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - Stripe signature header
 * @returns {Object} Event object
 */
function verifyWebhook(payload, signature) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
  }
  
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

module.exports = {
  stripe,
  PLANS,
  createCheckoutSession,
  createPortalSession,
  getSubscription,
  cancelSubscription,
  updateSubscription,
  verifyWebhook
};

