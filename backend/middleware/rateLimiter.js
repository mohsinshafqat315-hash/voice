// Rate limiting middleware - prevents abuse
// Limits requests per IP address with user-aware limits

const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Custom key generator - use user ID if authenticated, otherwise IP
const keyGenerator = (req) => {
  return req.user?.id ? `user:${req.user.id}` : `ip:${req.ip}`;
};

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP/user to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests. Please try again in a few minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      url: req.originalUrl,
      method: req.method,
      userId: req.user?.id,
      ip: req.ip
    });
    
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again in a few minutes.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      email: req.body?.email,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts. Please try again in 15 minutes.'
    });
  }
});

// Upload rate limiter - more lenient for authenticated users
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req) => {
    // Authenticated users get higher limits
    return req.user ? 100 : 20;
  },
  message: {
    success: false,
    error: 'Too many uploads. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: (req, res) => {
    logger.warn('Upload rate limit exceeded', {
      userId: req.user?.id,
      ip: req.ip
    });
    
    res.status(429).json({
      success: false,
      error: 'Too many uploads. Please try again in an hour.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Strict rate limiter for AI/OCR operations
const processingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req) => {
    // Plan-based limits
    const plan = req.user?.subscription?.plan || 'free';
    const limits = { free: 10, pro: 50, business: 200, enterprise: 1000 };
    return limits[plan] || 10;
  },
  message: {
    success: false,
    error: 'Processing limit reached. Please upgrade your plan for more processing capacity.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: (req, res) => {
    logger.warn('Processing rate limit exceeded', {
      userId: req.user?.id,
      plan: req.user?.subscription?.plan,
      ip: req.ip
    });
    
    res.status(429).json({
      success: false,
      error: 'Processing limit reached for your plan. Please upgrade for more capacity.',
      requiresUpgrade: true
    });
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  processingLimiter
};

