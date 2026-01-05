// Error handling middleware - centralized error handling
// Formats errors, logs issues, returns appropriate status codes

const logger = require('../utils/logger');

// User-friendly error messages
const USER_FRIENDLY_MESSAGES = {
  'Resource not found': 'The requested item could not be found.',
  'Duplicate field value entered': 'This information already exists. Please use a different value.',
  'Invalid token': 'Your session has expired. Please log in again.',
  'Token expired': 'Your session has expired. Please log in again.',
  'Server Error': 'Something went wrong. Please try again later.',
  'Validation failed': 'Please check your input and try again.',
  'No token provided': 'Please log in to access this resource.',
  'User not found': 'Your account could not be found. Please contact support.',
  'Invalid credentials': 'The email or password you entered is incorrect.',
  'Receipt limit reached': 'You have reached your plan limit. Please upgrade to continue.',
  'File size exceeds limit': 'The file is too large. Please upload a file smaller than 10MB.',
  'Invalid file type': 'Please upload a JPEG, PNG, WEBP, or PDF file.',
  'OCR processing failed': 'We couldn\'t read your receipt. Please try uploading a clearer image.',
  'AI analysis failed': 'We encountered an issue analyzing your receipt. Please try again.'
};

/**
 * Get user-friendly error message
 */
function getUserFriendlyMessage(message) {
  // Check for exact match
  if (USER_FRIENDLY_MESSAGES[message]) {
    return USER_FRIENDLY_MESSAGES[message];
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(USER_FRIENDLY_MESSAGES)) {
    if (message.includes(key)) {
      return value;
    }
  }
  
  // Return generic message for unknown errors in production
  if (process.env.NODE_ENV === 'production') {
    return 'Something went wrong. Please try again later.';
  }
  
  return message;
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Structured error logging
  logger.error('Request error', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }
  
  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }
  
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }
  
  // Rate limit errors
  if (err.status === 429) {
    error = { 
      message: 'Too many requests. Please try again later.', 
      statusCode: 429 
    };
  }
  
  // Timeout errors
  if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
    error = { 
      message: 'Request timed out. Please try again.', 
      statusCode: 408 
    };
  }
  
  const statusCode = error.statusCode || 500;
  const userMessage = getUserFriendlyMessage(error.message || 'Server Error');
  
  res.status(statusCode).json({
    success: false,
    error: userMessage,
    ...(process.env.NODE_ENV === 'development' && { 
      details: error.message,
      stack: err.stack 
    })
  });
};

module.exports = errorHandler;
