// Validation middleware - request validation
// Validates request body, params, query strings using schemas

const { isValidEmail, isValidAmount, isValidDate, isValidCurrency } = require('../utils/validators');

/**
 * Create validation middleware
 * @param {Object} schema - Validation schema
 * @returns {Function} Express middleware
 */
function validate(schema) {
  return (req, res, next) => {
    const errors = [];
    
    // Validate body
    if (schema.body) {
      const bodyErrors = validateObject(req.body, schema.body);
      errors.push(...bodyErrors.map(e => `body.${e}`));
    }
    
    // Validate params
    if (schema.params) {
      const paramErrors = validateObject(req.params, schema.params);
      errors.push(...paramErrors.map(e => `params.${e}`));
    }
    
    // Validate query
    if (schema.query) {
      const queryErrors = validateObject(req.query, schema.query);
      errors.push(...queryErrors.map(e => `query.${e}`));
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }
    
    next();
  };
}

/**
 * Validate object against schema
 * @param {Object} obj - Object to validate
 * @param {Object} schema - Validation schema
 * @returns {Array<string>} Array of error messages
 */
function validateObject(obj, schema) {
  const errors = [];
  
  for (const [key, rules] of Object.entries(schema)) {
    const value = obj[key];
    
    // Required check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${key} is required`);
      continue;
    }
    
    // Skip if not required and value is empty
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }
    
    // Type check
    if (rules.type) {
      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`${key} must be a string`);
        continue;
      }
      if (rules.type === 'number' && typeof value !== 'number' && isNaN(parseFloat(value))) {
        errors.push(`${key} must be a number`);
        continue;
      }
      if (rules.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`${key} must be a boolean`);
        continue;
      }
      if (rules.type === 'array' && !Array.isArray(value)) {
        errors.push(`${key} must be an array`);
        continue;
      }
      if (rules.type === 'object' && typeof value !== 'object' || Array.isArray(value)) {
        errors.push(`${key} must be an object`);
        continue;
      }
    }
    
    // Custom validators
    if (rules.validator) {
      const result = rules.validator(value);
      if (result !== true) {
        errors.push(`${key}: ${result}`);
      }
    }
    
    // Email validation
    if (rules.email && !isValidEmail(value)) {
      errors.push(`${key} must be a valid email`);
    }
    
    // Amount validation
    if (rules.amount && !isValidAmount(value)) {
      errors.push(`${key} must be a valid amount`);
    }
    
    // Date validation
    if (rules.date && !isValidDate(value)) {
      errors.push(`${key} must be a valid date (YYYY-MM-DD)`);
    }
    
    // Currency validation
    if (rules.currency && !isValidCurrency(value)) {
      errors.push(`${key} must be a valid currency code`);
    }
    
    // Min/Max length
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`${key} must be at least ${rules.minLength} characters`);
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`${key} must be at most ${rules.maxLength} characters`);
    }
    
    // Min/Max value
    if (rules.min !== undefined && parseFloat(value) < rules.min) {
      errors.push(`${key} must be at least ${rules.min}`);
    }
    if (rules.max !== undefined && parseFloat(value) > rules.max) {
      errors.push(`${key} must be at most ${rules.max}`);
    }
    
    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${key} must be one of: ${rules.enum.join(', ')}`);
    }
  }
  
  return errors;
}

// Common validation schemas
const schemas = {
  register: {
    body: {
      email: { required: true, type: 'string', email: true },
      password: { required: true, type: 'string', minLength: 6 },
      name: { required: true, type: 'string', minLength: 2 },
      company: { required: false, type: 'string' },
      country: { required: false, type: 'string' },
      currency: { required: false, type: 'string', currency: true }
    }
  },
  login: {
    body: {
      email: { required: true, type: 'string', email: true },
      password: { required: true, type: 'string' }
    }
  },
  receiptUpload: {
    body: {
      vendor: { required: false, type: 'string' },
      date: { required: false, type: 'string', date: true },
      total: { required: false, type: 'number', amount: true, min: 0 }
    }
  }
};

module.exports = {
  validate,
  validateObject,
  schemas
};
