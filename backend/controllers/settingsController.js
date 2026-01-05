// Settings controller - handles user settings and preferences
// Update user preferences, subscription management

const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

/**
 * Get user settings
 * GET /api/settings
 */
async function getSettings(req, res) {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      settings: {
        country: user.country,
        currency: user.currency,
        subscription: user.subscription,
        notifications: user.settings.notifications,
        preferences: user.settings.preferences,
        payoutAccount: user.payoutAccount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Update user settings
 * PUT /api/settings
 */
async function updateSettings(req, res) {
  try {
    const { country, currency, notifications, preferences } = req.body;
    const user = await User.findById(req.user.id);
    
    if (country) user.country = country;
    if (currency) user.currency = currency;
    if (notifications) {
      user.settings.notifications = {
        ...user.settings.notifications,
        ...notifications
      };
    }
    if (preferences) {
      user.settings.preferences = {
        ...user.settings.preferences,
        ...preferences
      };
    }
    
    await user.save();
    
    // Log audit
    await AuditLog.create({
      userId: user._id,
      action: 'settings_changed',
      entityType: 'user',
      entityId: user._id,
      details: { country, currency, notifications, preferences }
    });
    
    res.json({
      success: true,
      settings: {
        country: user.country,
        currency: user.currency,
        subscription: user.subscription,
        notifications: user.settings.notifications,
        preferences: user.settings.preferences
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Update payout account
 * PUT /api/settings/payout
 */
async function updatePayoutAccount(req, res) {
  try {
    const { provider, accountId, metadata } = req.body;
    const user = await User.findById(req.user.id);
    
    user.payoutAccount = {
      provider: provider || user.payoutAccount?.provider,
      accountId: accountId || user.payoutAccount?.accountId,
      metadata: metadata || user.payoutAccount?.metadata
    };
    
    await user.save();
    
    res.json({
      success: true,
      payoutAccount: user.payoutAccount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  getSettings,
  updateSettings,
  updatePayoutAccount
};

