// EU country-specific tax rules - individual country regulations
// Country-specific VAT rates, local tax rules, compliance requirements

const { getCountryVATRate, validateVATFormat } = require('./vatRules');

const COUNTRY_SPECIFIC_RULES = {
  'DE': { // Germany
    standardVAT: 0.19,
    reducedVAT: 0.07,
    requiresVATID: true,
    vatFormat: /^DE\d{9}$/
  },
  'FR': { // France
    standardVAT: 0.20,
    reducedVAT: 0.055,
    requiresVATID: true,
    vatFormat: /^FR[A-Z0-9]{2}\d{9}$/
  },
  'IT': { // Italy
    standardVAT: 0.22,
    reducedVAT: 0.10,
    requiresVATID: true,
    vatFormat: /^IT\d{11}$/
  },
  'ES': { // Spain
    standardVAT: 0.21,
    reducedVAT: 0.10,
    requiresVATID: true,
    vatFormat: /^ES[A-Z0-9]\d{7}[A-Z0-9]$/
  },
  'NL': { // Netherlands
    standardVAT: 0.21,
    reducedVAT: 0.09,
    requiresVATID: true,
    vatFormat: /^NL\d{9}B\d{2}$/
  },
  'BE': { // Belgium
    standardVAT: 0.21,
    reducedVAT: 0.06,
    requiresVATID: true,
    vatFormat: /^BE\d{10}$/
  },
  'AT': { // Austria
    standardVAT: 0.20,
    reducedVAT: 0.10,
    requiresVATID: true,
    vatFormat: /^ATU\d{8}$/
  },
  'PL': { // Poland
    standardVAT: 0.23,
    reducedVAT: 0.08,
    requiresVATID: true,
    vatFormat: /^PL\d{10}$/
  },
  'SE': { // Sweden
    standardVAT: 0.25,
    reducedVAT: 0.12,
    requiresVATID: true,
    vatFormat: /^SE\d{12}$/
  },
  'DK': { // Denmark
    standardVAT: 0.25,
    reducedVAT: 0.25, // No reduced rate
    requiresVATID: true,
    vatFormat: /^DK\d{8}$/
  }
};

/**
 * Validate country-specific VAT rules
 * @param {Object} receiptData - Receipt data
 * @param {string} countryCode - EU country code
 * @returns {Object} Validation result
 */
function validateCountryRules(receiptData, countryCode) {
  const result = {
    compliant: true,
    alerts: [],
    suggestions: []
  };
  
  const rules = COUNTRY_SPECIFIC_RULES[countryCode?.toUpperCase()];
  if (!rules) {
    result.suggestions.push(`Country-specific rules not available for ${countryCode}`);
    return result;
  }
  
  // Validate VAT ID format
  if (receiptData.VAT_ID) {
    const vatValidation = validateVATFormat(receiptData.VAT_ID);
    if (!vatValidation.valid) {
      result.compliant = false;
      result.alerts.push(`Invalid VAT ID format for ${countryCode}: ${vatValidation.message}`);
    } else if (vatValidation.countryCode !== countryCode) {
      result.compliant = false;
      result.alerts.push(`VAT ID country code (${vatValidation.countryCode}) doesn't match receipt country (${countryCode})`);
    }
    
    // Check format matches country-specific pattern
    if (rules.vatFormat && !rules.vatFormat.test(receiptData.VAT_ID)) {
      result.compliant = false;
      result.alerts.push(`VAT ID doesn't match ${countryCode} format pattern`);
    }
  } else if (rules.requiresVATID) {
    result.compliant = false;
    result.alerts.push(`VAT ID is required for ${countryCode} receipts`);
  }
  
  // Validate VAT rate
  if (receiptData.tax && receiptData.total) {
    const subtotal = receiptData.total - receiptData.tax;
    const actualVATRate = receiptData.tax / subtotal;
    const expectedRate = rules.standardVAT;
    
    const rateDifference = Math.abs(actualVATRate - expectedRate);
    if (rateDifference > 0.01) { // 1% tolerance
      result.suggestions.push(
        `VAT rate (${(actualVATRate * 100).toFixed(2)}%) differs from ${countryCode} standard rate ` +
        `(${(expectedRate * 100).toFixed(2)}%). May be using reduced rate or special category.`
      );
    }
  }
  
  return result;
}

/**
 * Get country-specific VAT rate
 * @param {string} countryCode - EU country code
 * @param {string} category - Product/service category (for reduced rates)
 * @returns {number} VAT rate (0-1)
 */
function getCountryVATRateByCategory(countryCode, category = 'standard') {
  const rules = COUNTRY_SPECIFIC_RULES[countryCode?.toUpperCase()];
  if (!rules) {
    return 0.20; // Default EU rate
  }
  
  if (category === 'reduced' && rules.reducedVAT !== undefined) {
    return rules.reducedVAT;
  }
  
  return rules.standardVAT;
}

module.exports = {
  validateCountryRules,
  getCountryVATRateByCategory,
  COUNTRY_SPECIFIC_RULES
};
