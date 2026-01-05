// Authentication routes - handles login, register, logout
// POST /auth/login, POST /auth/register, POST /auth/logout, POST /auth/refresh

const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Protected routes
router.get('/me', authenticate, getMe);

module.exports = router;
