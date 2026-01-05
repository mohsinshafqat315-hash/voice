// Request timeout middleware
// Prevents requests from hanging indefinitely

const logger = require('../utils/logger');

/**
 * Create timeout middleware
 * @param {number} timeoutMs - Timeout in milliseconds
 */
const requestTimeout = (timeoutMs = 30000) => {
  return (req, res, next) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn('Request timeout', {
          url: req.originalUrl,
          method: req.method,
          timeout: timeoutMs,
          userId: req.user?.id
        });
        
        res.status(408).json({
          success: false,
          error: 'Request timed out. Please try again.'
        });
      }
    }, timeoutMs);
    
    // Clear timeout when response is sent
    res.on('finish', () => {
      clearTimeout(timeout);
    });
    
    next();
  };
};

/**
 * Timeout for long-running operations (OCR, AI)
 */
const longOperationTimeout = (timeoutMs = 60000) => {
  return requestTimeout(timeoutMs);
};

module.exports = {
  requestTimeout,
  longOperationTimeout
};

