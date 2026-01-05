// Webhook controller - handles Stripe webhook events
// Processes subscription updates, payment confirmations

const User = require('../models/User');
const Payment = require('../models/Payment');
const { verifyWebhook, getSubscription } = require('../utils/stripe');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

/**
 * Handle Stripe webhook events
 * POST /api/webhooks/stripe
 */
async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  
  if (!sig) {
    logger.warn('Webhook missing signature', { ip: req.ip });
    return res.status(400).send('Missing stripe-signature header');
  }
  
  let event;
  
  try {
    // Verify webhook signature (req.body is raw Buffer from express.raw())
    const payload = req.body;
    event = verifyWebhook(payload, sig);
  } catch (err) {
    logger.error('Webhook signature verification failed', { 
      error: err.message,
      ip: req.ip 
    });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event with retry logic
  try {
    const maxRetries = 3;
    let retries = 0;
    let success = false;
    
    while (retries < maxRetries && !success) {
      try {
        switch (event.type) {
          case 'checkout.session.completed':
            await handleCheckoutCompleted(event.data.object);
            break;
          
          case 'customer.subscription.created':
          case 'customer.subscription.updated':
            await handleSubscriptionUpdate(event.data.object);
            break;
          
          case 'customer.subscription.deleted':
            await handleSubscriptionDeleted(event.data.object);
            break;
          
          case 'invoice.payment_succeeded':
            await handlePaymentSucceeded(event.data.object);
            break;
          
          case 'invoice.payment_failed':
            await handlePaymentFailed(event.data.object);
            break;
          
          default:
            logger.debug('Unhandled webhook event type', { type: event.type });
        }
        
        success = true;
        logger.info('Webhook processed successfully', { 
          type: event.type,
          eventId: event.id 
        });
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        const delay = Math.pow(2, retries) * 1000;
        logger.warn('Webhook processing failed, retrying', {
          type: event.type,
          attempt: retries,
          error: error.message,
          delay
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook handler error', { 
      error: error.message,
      stack: error.stack,
      type: event.type,
      eventId: event.id 
    });
    
    // Return 200 to prevent Stripe from retrying (we'll handle retries internally)
    // Or return 500 if we want Stripe to retry
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutCompleted(session) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan;
  
  if (!userId || !plan) {
    console.error('Missing userId or plan in checkout session metadata');
    return;
  }
  
  const user = await User.findById(userId);
  if (!user) {
    console.error('User not found:', userId);
    return;
  }
  
  // Get subscription details
  const subscription = await getSubscription(session.subscription);
  
  // Update user subscription
  user.subscription = {
    plan: plan,
    status: subscription.status === 'trialing' ? 'trialing' : 'active',
    stripeCustomerId: subscription.customer,
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscription.items.data[0].price.id,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end
  };
  
  await user.save();
  
  // Create payment record
  try {
    await Payment.create({
      userId: user._id,
      type: 'subscription',
      amount: subscription.items.data[0].price.unit_amount / 100,
      currency: subscription.items.data[0].price.currency.toUpperCase(),
      status: 'completed',
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer,
      plan: plan,
      billingPeriod: {
        start: new Date(subscription.current_period_start * 1000),
        end: new Date(subscription.current_period_end * 1000)
      }
    });
  } catch (paymentError) {
    console.error('Failed to create payment record:', paymentError);
    // Continue even if payment record creation fails
  }
  
  // Log audit (fire and forget)
  AuditLog.create({
    userId: user._id,
    action: 'subscription_created',
    entityType: 'subscription',
    details: { plan, subscriptionId: subscription.id }
  }).catch(err => {
    logger.error('Failed to create audit log', { error: err.message });
  });
  
  logger.info('Subscription created', {
    userId: user._id,
    plan,
    subscriptionId: subscription.id
  });
}

/**
 * Handle subscription update
 */
async function handleSubscriptionUpdate(subscription) {
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    // Try to find user by customer ID
    const user = await User.findOne({ 'subscription.stripeCustomerId': subscription.customer });
    if (!user) {
      console.error('User not found for subscription:', subscription.id);
      return;
    }
    
    // Update subscription
    user.subscription.status = subscription.status;
    user.subscription.currentPeriodStart = new Date(subscription.current_period_start * 1000);
    user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    user.subscription.cancelAtPeriodEnd = subscription.cancel_at_period_end;
    
    await user.save();
    
    await AuditLog.create({
      userId: user._id,
      action: 'subscription_updated',
      entityType: 'subscription',
      details: { subscriptionId: subscription.id, status: subscription.status }
    });
  }
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(subscription) {
  const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
  
  if (!user) {
    console.error('User not found for subscription:', subscription.id);
    return;
  }
  
  // Downgrade to free
  user.subscription = {
    plan: 'free',
    status: 'canceled',
    stripeCustomerId: user.subscription.stripeCustomerId,
    stripeSubscriptionId: null,
    stripePriceId: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    trialEnd: null,
    cancelAtPeriodEnd: false
  };
  
  await user.save();
  
  await AuditLog.create({
    userId: user._id,
    action: 'subscription_canceled',
    entityType: 'subscription',
    details: { subscriptionId: subscription.id }
  });
}

/**
 * Handle payment succeeded
 */
async function handlePaymentSucceeded(invoice) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;
  
  const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscriptionId });
  if (!user) return;
  
  // Create payment record
  await Payment.create({
    userId: user._id,
    type: 'subscription',
    amount: invoice.amount_paid / 100,
    currency: invoice.currency.toUpperCase(),
    status: 'completed',
    stripeInvoiceId: invoice.id,
    stripeSubscriptionId: subscriptionId,
    stripeCustomerId: invoice.customer,
    plan: user.subscription.plan,
    billingPeriod: {
      start: new Date(invoice.period_start * 1000),
      end: new Date(invoice.period_end * 1000)
    }
  });
  
  await AuditLog.create({
    userId: user._id,
    action: 'payment_processed',
    entityType: 'payment',
    details: { invoiceId: invoice.id, amount: invoice.amount_paid / 100 }
  });
}

/**
 * Handle payment failed
 */
async function handlePaymentFailed(invoice) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;
  
  const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscriptionId });
  if (!user) return;
  
  // Update subscription status
  user.subscription.status = 'past_due';
  await user.save();
  
  await AuditLog.create({
    userId: user._id,
    action: 'payment_processed',
    entityType: 'payment',
    details: { invoiceId: invoice.id, status: 'failed' }
  });
}

module.exports = {
  handleStripeWebhook
};

