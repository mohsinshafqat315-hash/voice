// Country-specific tax rules - unified country rules handler
// Routes to US or EU rules based on country/currency

const { validateUSTax } = require('./us/taxRules');
const { validateEUReceipt } = require('./eu/vatRules');

/**
 * Validate receipt based on country
 * @param {Object} receiptData - Receipt data
 * @param {string} countryCode - Country code
 * @returns {Promise<Object>} Validation result
 */
async function validateCountryRules(receiptData, countryCode) {
  const currency = receiptData.currency || 'USD';
  
  // Determine region
  const euCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'XI'
  ];
  
  const isEU = euCountries.includes(countryCode?.toUpperCase()) || currency === 'EUR';
  const isUS = countryCode?.toUpperCase() === 'US' || currency === 'USD';
  
  if (isEU) {
    return await validateEUReceipt(receiptData);
  } else if (isUS) {
    return validateUSTax(receiptData, countryCode);
  } else {
    // Default validation
    return {
      compliant: true,
      alerts: [],
      suggestions: [`Country-specific rules not available for ${countryCode}`]
    };
  }
}

module.exports = {
  validateCountryRules
};

