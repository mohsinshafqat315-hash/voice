// Admin controller - admin-only operations
// View subscriptions, payments, high-risk receipts, manage users

const User = require('../models/User');
const Receipt = require('../models/Receipt');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');

/**
 * Get all users (admin only)
 * GET /api/admin/users
 */
async function getUsers(req, res) {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
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
 * Get subscription statistics
 * GET /api/admin/subscriptions
 */
async function getSubscriptionStats(req, res) {
  try {
    const users = await User.find();
    
    const stats = {
      total: users.length,
      byPlan: {
        free: users.filter(u => u.subscription.plan === 'free').length,
        pro: users.filter(u => u.subscription.plan === 'pro').length,
        business: users.filter(u => u.subscription.plan === 'business').length,
        enterprise: users.filter(u => u.subscription.plan === 'enterprise').length
      },
      byStatus: {
        active: users.filter(u => u.subscription.status === 'active').length,
        trialing: users.filter(u => u.subscription.status === 'trialing').length,
        past_due: users.filter(u => u.subscription.status === 'past_due').length,
        canceled: users.filter(u => u.subscription.status === 'canceled').length
      }
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get high-risk receipts
 * GET /api/admin/high-risk-receipts
 */
async function getHighRiskReceipts(req, res) {
  try {
    const { limit = 100 } = req.query;
    
    const receipts = await Receipt.find({
      'aiAnalysis.risk_score': { $gte: 60 }
    })
      .populate('userId', 'email name')
      .sort({ 'aiAnalysis.risk_score': -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: receipts.length,
      receipts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get payment statistics
 * GET /api/admin/payments
 */
async function getPaymentStats(req, res) {
  try {
    const { dateFrom, dateTo } = req.query;
    
    const query = { status: 'completed' };
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }
    
    const payments = await Payment.find(query).sort({ createdAt: -1 });
    
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const byPlan = {};
    
    payments.forEach(payment => {
      const plan = payment.plan || 'unknown';
      if (!byPlan[plan]) {
        byPlan[plan] = { count: 0, revenue: 0 };
      }
      byPlan[plan].count++;
      byPlan[plan].revenue += payment.amount || 0;
    });
    
    res.json({
      success: true,
      stats: {
        totalPayments: payments.length,
        totalRevenue,
        byPlan
      },
      payments: payments.slice(0, 50) // Latest 50
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Override user subscription (admin only)
 * PUT /api/admin/users/:id/subscription
 */
async function overrideSubscription(req, res) {
  try {
    const { plan, status } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    if (plan) user.subscription.plan = plan;
    if (status) user.subscription.status = status;
    
    await user.save();
    
    await AuditLog.create({
      userId: req.user.id,
      action: 'admin_action',
      entityType: 'user',
      entityId: user._id,
      details: { action: 'override_subscription', plan, status }
    });
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        subscription: user.subscription
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
  getUsers,
  getSubscriptionStats,
  getHighRiskReceipts,
  getPaymentStats,
  overrideSubscription
};

