// Validator utility functions - input validation helpers
// Email validation, amount validation, date validation

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
}

/**
 * Validate amount (positive number)
 * @param {*} amount - Amount to validate
 * @returns {boolean} True if valid
 */
function isValidAmount(amount) {
  const num = parseFloat(amount);
  return !isNaN(num) && num >= 0 && isFinite(num);
}

/**
 * Validate date string (YYYY-MM-DD)
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid
 */
function isValidDate(dateString) {
  if (!dateString || typeof dateString !== 'string') return false;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate currency code
 * @param {string} currency - Currency code
 * @returns {boolean} True if valid
 */
function isValidCurrency(currency) {
  const validCurrencies = ['USD', 'EUR', 'PKR', 'GBP'];
  return validCurrencies.includes(currency?.toUpperCase());
}

/**
 * Validate VAT ID format (EU)
 * @param {string} vatId - VAT ID to validate
 * @returns {boolean} True if valid format
 */
function isValidVATID(vatId) {
  if (!vatId || typeof vatId !== 'string') return false;
  // EU VAT ID format: 2 letters (country) + 2-12 alphanumeric
  const vatRegex = /^[A-Z]{2}[A-Z0-9]{2,12}$/;
  return vatRegex.test(vatId.trim().toUpperCase());
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
function validatePassword(password, options = {}) {
  const {
    minLength = 6,
    requireUppercase = false,
    requireLowercase = false,
    requireNumbers = false,
    requireSpecial = false
  } = options;
  
  const result = {
    valid: true,
    errors: []
  };
  
  if (!password || password.length < minLength) {
    result.valid = false;
    result.errors.push(`Password must be at least ${minLength} characters`);
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    result.valid = false;
    result.errors.push('Password must contain at least one uppercase letter');
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    result.valid = false;
    result.errors.push('Password must contain at least one lowercase letter');
  }
  
  if (requireNumbers && !/\d/.test(password)) {
    result.valid = false;
    result.errors.push('Password must contain at least one number');
  }
  
  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.valid = false;
    result.errors.push('Password must contain at least one special character');
  }
  
  return result;
}

/**
 * Validate phone number
 * @param {string} phone - Phone number
 * @returns {boolean} True if valid
 */
function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  // Basic international format: + followed by digits
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.trim());
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
function isValidURL(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  isValidEmail,
  isValidAmount,
  isValidDate,
  isValidCurrency,
  isValidVATID,
  validatePassword,
  isValidPhone,
  isValidURL
};
