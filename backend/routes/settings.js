// Settings routes - handles user settings endpoints
// GET /settings, PUT /settings

const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, updatePayoutAccount } = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get settings
router.get('/', getSettings);

// Update settings
router.put('/', updateSettings);

// Update payout account
router.put('/payout', updatePayoutAccount);

module.exports = router;

