// Admin routes - handles admin-only endpoints
// GET /admin/users, GET /admin/subscriptions, etc.

const express = require('express');
const router = express.Router();
const {
  getUsers,
  getSubscriptionStats,
  getHighRiskReceipts,
  getPaymentStats,
  overrideSubscription
} = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Get all users
router.get('/users', getUsers);

// Get subscription statistics
router.get('/subscriptions', getSubscriptionStats);

// Get high-risk receipts
router.get('/high-risk-receipts', getHighRiskReceipts);

// Get payment statistics
router.get('/payments', getPaymentStats);

// Override user subscription
router.put('/users/:id/subscription', overrideSubscription);

module.exports = router;

