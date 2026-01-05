// Auth controller - business logic for authentication
// Login validation, token generation, password hashing

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Generate JWT token
const generateToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.sign({ userId }, jwtSecret, {
    expiresIn: '30d'
  });
};

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, name, company, country, currency } = req.body;
    const logger = require('../utils/logger');
    
    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email, password, and name'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }
    
    // Additional password strength check
    if (password.length > 128) {
      return res.status(400).json({
        success: false,
        error: 'Password is too long'
      });
    }
    
    // Check for common weak passwords (basic check)
    const weakPasswords = ['password', '123456', 'password123', 'admin'];
    if (weakPasswords.includes(password.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Please choose a stronger password'
      });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }
    
    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      name,
      company,
      country: country || 'US',
      currency: currency || 'USD'
    });
    
    // Generate token
    const token = generateToken(user._id);
    
    // Log audit (fire and forget for performance)
    AuditLog.create({
      userId: user._id,
      action: 'user_created',
      entityType: 'user',
      entityId: user._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    }).catch(err => {
      logger.error('Failed to create audit log', { error: err.message });
    });
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscription: user.subscription
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    // Log audit (fire and forget)
    const logger = require('../utils/logger');
    AuditLog.create({
      userId: user._id,
      action: 'user_login',
      entityType: 'user',
      entityId: user._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    }).catch(err => {
      logger.error('Failed to create audit log', { error: err.message });
    });
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscription: user.subscription
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
        country: user.country,
        currency: user.currency,
        subscription: user.subscription,
        settings: user.settings,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  generateToken
};
