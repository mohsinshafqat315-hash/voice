// Payment routes - handles Stripe payments and subscriptions
// POST /payments/create-checkout, POST /payments/create-portal, GET /payments/history

const express = require('express');
const router = express.Router();
const { createCheckout, createPortal, getPaymentHistory, getPlans } = require('../controllers/paymentsController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get available plans (public for authenticated users)
router.get('/plans', getPlans);

// Create checkout session
router.post('/create-checkout', createCheckout);

// Create portal session
router.post('/create-portal', createPortal);

// Get payment history
router.get('/history', getPaymentHistory);

module.exports = router;

