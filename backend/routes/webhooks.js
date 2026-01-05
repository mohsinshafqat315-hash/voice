// Webhook routes - handles external webhooks (Stripe, etc.)
// POST /webhooks/stripe

const express = require('express');
const router = express.Router();
const { handleStripeWebhook } = require('../controllers/webhookController');

// Stripe webhook endpoint (must use raw body for signature verification)
// Note: This route must be registered BEFORE body-parsing middleware in server.js
router.post('/stripe', 
  express.raw({ type: 'application/json' }), 
  handleStripeWebhook
);

module.exports = router;

