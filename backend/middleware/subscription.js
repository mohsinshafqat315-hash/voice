// Subscription middleware - enforces plan limits
// Checks subscription status and limits before allowing operations

const User = require('../models/User');
const Receipt = require('../models/Receipt');
const logger = require('../utils/logger');

/**
 * Check if user has active subscription
 */
const requireActiveSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.hasActiveSubscription() && user.subscription.plan === 'free') {
      // Free plan is always active
      req.user = user;
      return next();
    }
    
    if (!user.hasActiveSubscription()) {
      return res.status(403).json({
        success: false,
        error: 'Your subscription is not active. Please update your payment method.',
        requiresUpgrade: true
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    logger.error('Subscription check failed', { error: error.message, userId: req.user?.id });
    res.status(500).json({
      success: false,
      error: 'Unable to verify subscription status'
    });
  }
};

/**
 * Check receipt limit before upload
 */
const checkReceiptLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const receiptCount = await Receipt.countDocuments({ userId: user._id });
    const limit = user.getReceiptLimit();
    
    if (limit > 0 && receiptCount >= limit) {
      const planName = user.subscription.plan === 'free' ? 'Pro' : 
                      user.subscription.plan === 'pro' ? 'Business' : 'Enterprise';
      
      return res.status(403).json({
        success: false,
        error: `You've reached your ${user.subscription.plan} plan limit of ${limit} receipts.`,
        limitReached: true,
        currentCount: receiptCount,
        limit,
        suggestedPlan: planName,
        upgradeUrl: '/settings/billing'
      });
    }
    
    req.receiptCount = receiptCount;
    req.receiptLimit = limit;
    next();
  } catch (error) {
    logger.error('Receipt limit check failed', { error: error.message, userId: req.user?.id });
    res.status(500).json({
      success: false,
      error: 'Unable to check receipt limit'
    });
  }
};

/**
 * Check if plan supports feature
 */
const requirePlan = (requiredPlan) => {
  const planLevels = { free: 0, pro: 1, business: 2, enterprise: 3 };
  
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      const userLevel = planLevels[user.subscription.plan] || 0;
      const requiredLevel = planLevels[requiredPlan] || 0;
      
      if (userLevel < requiredLevel) {
        return res.status(403).json({
          success: false,
          error: `This feature requires a ${requiredPlan} plan or higher.`,
          requiresUpgrade: true,
          currentPlan: user.subscription.plan,
          requiredPlan
        });
      }
      
      next();
    } catch (error) {
      logger.error('Plan check failed', { error: error.message, userId: req.user?.id });
      res.status(500).json({
        success: false,
        error: 'Unable to verify plan access'
      });
    }
  };
};

module.exports = {
  requireActiveSubscription,
  checkReceiptLimit,
  requirePlan
};

