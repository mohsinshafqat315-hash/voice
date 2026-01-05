// Helper utility functions - common helper functions
// Date formatting, currency conversion, string manipulation

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currency = 'USD') {
  const symbols = {
    USD: '$',
    EUR: '€',
    PKR: '₨',
    GBP: '£'
  };
  
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Convert currency (simplified - in production use real exchange rates)
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @returns {number} Converted amount
 */
function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return amount;
  
  // Mock exchange rates (in production, fetch from API)
  const rates = {
    USD: { EUR: 0.92, PKR: 278, GBP: 0.79 },
    EUR: { USD: 1.09, PKR: 302, GBP: 0.86 },
    PKR: { USD: 0.0036, EUR: 0.0033, GBP: 0.0028 },
    GBP: { USD: 1.27, EUR: 1.16, PKR: 352 }
  };
  
  const rate = rates[fromCurrency]?.[toCurrency] || 1;
  return amount * rate;
}

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
function truncate(str, maxLength = 50) {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Generate random string
 * @param {number} length - String length
 * @returns {string} Random string
 */
function generateRandomString(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Sanitize filename
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-z0-9.-]/gi, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

/**
 * Parse query string to object
 * @param {string} queryString - Query string
 * @returns {Object} Parsed object
 */
function parseQueryString(queryString) {
  const params = {};
  if (!queryString) return params;
  
  queryString.split('&').forEach(param => {
    const [key, value] = param.split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  });
  
  return params;
}

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if value is empty
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 */
function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

module.exports = {
  formatCurrency,
  convertCurrency,
  truncate,
  generateRandomString,
  sanitizeFilename,
  parseQueryString,
  deepClone,
  isEmpty
};
