// User routes - handles user management endpoints
// GET /users, PUT /users/:id, DELETE /users/:id

const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getSubscriptionStatus
} = require('../controllers/usersController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get user profile
router.get('/profile', getProfile);

// Update user profile
router.put('/profile', updateProfile);

// Get subscription status
router.get('/subscription', getSubscriptionStatus);

module.exports = router;
