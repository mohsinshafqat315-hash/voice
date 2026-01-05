// Input sanitization utilities
// Removes dangerous characters, normalizes input, prevents injection attacks

/**
 * Sanitize string input
 * @param {string} input - Input string
 * @param {Object} options - Sanitization options
 * @returns {string} Sanitized string
 */
function sanitizeString(input, options = {}) {
  if (typeof input !== 'string') {
    return input;
  }
  
  let sanitized = input.trim();
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Remove control characters (except newlines and tabs for some fields)
  if (!options.allowControlChars) {
    sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  }
  
  // Limit length
  if (options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }
  
  return sanitized;
}

/**
 * Sanitize email
 * @param {string} email - Email address
 * @returns {string} Sanitized email
 */
function sanitizeEmail(email) {
  if (typeof email !== 'string') {
    return '';
  }
  
  return email.toLowerCase().trim().replace(/[^\w@.-]/g, '');
}

/**
 * Sanitize number
 * @param {*} input - Input value
 * @param {Object} options - Options (min, max, allowFloat)
 * @returns {number|null} Sanitized number or null
 */
function sanitizeNumber(input, options = {}) {
  if (input === null || input === undefined || input === '') {
    return null;
  }
  
  const num = parseFloat(input);
  
  if (isNaN(num)) {
    return null;
  }
  
  if (!options.allowFloat && !Number.isInteger(num)) {
    return null;
  }
  
  if (options.min !== undefined && num < options.min) {
    return options.min;
  }
  
  if (options.max !== undefined && num > options.max) {
    return options.max;
  }
  
  return num;
}

/**
 * Sanitize date
 * @param {*} input - Input value
 * @returns {Date|null} Valid date or null
 */
function sanitizeDate(input) {
  if (!input) {
    return null;
  }
  
  const date = new Date(input);
  
  if (isNaN(date.getTime())) {
    return null;
  }
  
  return date;
}

/**
 * Sanitize object recursively
 * @param {Object} obj - Object to sanitize
 * @param {Object} schema - Schema defining sanitization rules
 * @returns {Object} Sanitized object
 */
function sanitizeObject(obj, schema = {}) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const fieldSchema = schema[key];
    
    if (fieldSchema) {
      if (fieldSchema.type === 'string') {
        sanitized[key] = sanitizeString(value, fieldSchema.options || {});
      } else if (fieldSchema.type === 'email') {
        sanitized[key] = sanitizeEmail(value);
      } else if (fieldSchema.type === 'number') {
        sanitized[key] = sanitizeNumber(value, fieldSchema.options || {});
      } else if (fieldSchema.type === 'date') {
        sanitized[key] = sanitizeDate(value);
      } else if (fieldSchema.type === 'object') {
        sanitized[key] = sanitizeObject(value, fieldSchema.schema || {});
      } else {
        sanitized[key] = value;
      }
    } else {
      // Default: sanitize as string if it's a string
      sanitized[key] = typeof value === 'string' ? sanitizeString(value) : value;
    }
  }
  
  return sanitized;
}

/**
 * Sanitize request body
 * @param {Object} schema - Sanitization schema
 * @returns {Function} Express middleware
 */
function sanitizeBody(schema) {
  return (req, res, next) => {
    if (req.body) {
      req.body = sanitizeObject(req.body, schema);
    }
    next();
  };
}

/**
 * Sanitize query parameters
 * @param {Object} schema - Sanitization schema
 * @returns {Function} Express middleware
 */
function sanitizeQuery(schema) {
  return (req, res, next) => {
    if (req.query) {
      req.query = sanitizeObject(req.query, schema);
    }
    next();
  };
}

module.exports = {
  sanitizeString,
  sanitizeEmail,
  sanitizeNumber,
  sanitizeDate,
  sanitizeObject,
  sanitizeBody,
  sanitizeQuery
};

