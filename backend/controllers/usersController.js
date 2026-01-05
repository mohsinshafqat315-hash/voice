// Users controller - business logic for user management
// Handles user CRUD, profile updates, role management

const User = require('../models/User');
const Receipt = require('../models/Receipt');
const AuditLog = require('../models/AuditLog');

/**
 * Get user profile
 * GET /api/users/profile
 */
async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    // Get user statistics
    const receiptCount = await Receipt.countDocuments({ userId: user._id });
    const totalSpent = await Receipt.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    res.json({
      success: true,
      user: {
        ...user.toObject(),
        stats: {
          receiptCount,
          totalSpent: totalSpent[0]?.total || 0
        }
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
 * Update user profile
 * PUT /api/users/profile
 */
async function updateProfile(req, res) {
  try {
    const { name, company, country, currency } = req.body;
    const user = await User.findById(req.user.id);
    
    if (name) user.name = name;
    if (company !== undefined) user.company = company;
    if (country) user.country = country;
    if (currency) user.currency = currency;
    
    await user.save();
    
    await AuditLog.create({
      userId: user._id,
      action: 'user_updated',
      entityType: 'user',
      entityId: user._id,
      ipAddress: req.ip
    });
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        company: user.company,
        country: user.country,
        currency: user.currency
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
 * Get user subscription status
 * GET /api/users/subscription
 */
async function getSubscriptionStatus(req, res) {
  try {
    const user = await User.findById(req.user.id);
    
    const receiptCount = await Receipt.countDocuments({ userId: user._id });
    const limit = user.getReceiptLimit();
    
    res.json({
      success: true,
      subscription: user.subscription,
      usage: {
        receipts: receiptCount,
        limit: limit === -1 ? 'Unlimited' : limit,
        remaining: limit === -1 ? 'Unlimited' : Math.max(0, limit - receiptCount)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getSubscriptionStatus
};
