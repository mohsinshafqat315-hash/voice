// EU VAT rules - European Union VAT regulations
// VAT rates by country, cross-border rules, VAT compliance requirements

/**
 * Validate EU receipt for VAT compliance
 * @param {Object} ocrData - Receipt data
 * @returns {Object} Validation result
 */
async function validateEUReceipt(ocrData) {
  const result = {
    compliant: true,
    alerts: [],
    suggestions: [],
    requiresReview: false
  };
  
  // EU receipts must have currency EUR
  if (ocrData.currency !== 'EUR') {
    result.compliant = false;
    result.alerts.push('Currency mismatch: Expected EUR for EU receipt');
  }
  
  // VAT_ID is required for EU receipts
  if (!ocrData.VAT_ID || ocrData.VAT_ID.trim() === '') {
    result.compliant = false;
    result.requiresReview = true;
    result.alerts.push('Missing VAT ID for EU compliance.');
    result.suggestions.push({
      field: 'VAT_ID',
      message: 'VAT ID is required for EU receipts. Please add the vendor VAT identification number.'
    });
  } else {
    // Validate VAT ID format
    const vatValidation = validateVATFormat(ocrData.VAT_ID);
    if (!vatValidation.valid) {
      result.compliant = false;
      result.alerts.push(`Invalid VAT ID format: ${vatValidation.message}`);
    }
  }
  
  // Validate VAT amount
  if (!ocrData.tax || ocrData.tax === 0) {
    result.suggestions.push({
      field: 'tax',
      message: 'No VAT found. Verify if this is a VAT-exempt transaction or if VAT was not captured by OCR.'
    });
  } else {
    // Validate VAT rate is within EU range (typically 0-27%)
    const vatRate = ((ocrData.tax || 0) / (ocrData.total - ocrData.tax)) * 100;
    if (vatRate > 27) {
      result.compliant = false;
      result.requiresReview = true;
      result.alerts.push(`Unusually high VAT rate: ${vatRate.toFixed(2)}%. EU VAT typically ranges from 0-27%.`);
    }
  }
  
  // Validate required fields for EU
  if (!ocrData.vendor) {
    result.compliant = false;
    result.alerts.push('Missing vendor name');
  }
  
  if (!ocrData.date) {
    result.compliant = false;
    result.alerts.push('Missing transaction date');
  }
  
  if (!ocrData.total || ocrData.total <= 0) {
    result.compliant = false;
    result.alerts.push('Invalid or missing total amount');
  }
  
  return result;
}

/**
 * Validate VAT ID format by country
 * @param {string} vatId - VAT identification number
 * @returns {Object} Validation result
 */
function validateVATFormat(vatId) {
  if (!vatId || vatId.trim() === '') {
    return { valid: false, message: 'VAT ID is empty' };
  }
  
  const cleaned = vatId.trim().toUpperCase().replace(/\s+/g, '');
  
  // Basic format validation (country code + numbers)
  // EU VAT IDs typically follow: CC + 2-12 alphanumeric characters
  const vatRegex = /^[A-Z]{2}[A-Z0-9]{2,12}$/;
  
  if (!vatRegex.test(cleaned)) {
    return {
      valid: false,
      message: 'VAT ID format invalid. Expected format: CC + 2-12 alphanumeric characters (e.g., DE123456789)'
    };
  }
  
  // Extract country code
  const countryCode = cleaned.substring(0, 2);
  const euCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'XI'
  ];
  
  if (!euCountries.includes(countryCode)) {
    return {
      valid: false,
      message: `Invalid EU country code: ${countryCode}`
    };
  }
  
  return { valid: true, countryCode, formatted: cleaned };
}

/**
 * Get EU country VAT rate
 * @param {string} countryCode - EU country code (e.g., 'DE', 'FR')
 * @returns {number} Standard VAT rate as decimal
 */
function getCountryVATRate(countryCode) {
  const vatRates = {
    'DE': 0.19, // Germany
    'FR': 0.20, // France
    'IT': 0.22, // Italy
    'ES': 0.21, // Spain
    'NL': 0.21, // Netherlands
    'BE': 0.21, // Belgium
    'AT': 0.20, // Austria
    'PL': 0.23, // Poland
    'SE': 0.25, // Sweden
    'DK': 0.25, // Denmark
    'FI': 0.24, // Finland
    'IE': 0.23, // Ireland
    'PT': 0.23, // Portugal
    'GR': 0.24, // Greece
    'CZ': 0.21, // Czech Republic
    'RO': 0.19, // Romania
    'HU': 0.27, // Hungary (highest in EU)
    'SK': 0.20, // Slovakia
    'SI': 0.22, // Slovenia
    'BG': 0.20, // Bulgaria
    'HR': 0.25, // Croatia
    'CY': 0.19, // Cyprus
    'MT': 0.18, // Malta
    'LU': 0.17, // Luxembourg
    'EE': 0.20, // Estonia
    'LV': 0.21, // Latvia
    'LT': 0.21  // Lithuania
  };
  
  return vatRates[countryCode] || 0.20; // Default 20%
}

/**
 * Validate country-specific VAT
 * @param {Object} ocrData - Receipt data
 * @param {string} countryCode - EU country code
 * @returns {Object} Validation result
 */
function validateCountryVAT(ocrData, countryCode) {
  const result = {
    compliant: true,
    alerts: [],
    suggestions: []
  };
  
  // Extract country code from VAT ID if available
  if (ocrData.VAT_ID) {
    const vatValidation = validateVATFormat(ocrData.VAT_ID);
    if (vatValidation.valid && vatValidation.countryCode) {
      countryCode = vatValidation.countryCode;
    }
  }
  
  if (!countryCode) {
    result.suggestions.push({
      field: 'country',
      message: 'Country code not detected. Unable to validate country-specific VAT rate.'
    });
    return result;
  }
  
  const expectedVATRate = getCountryVATRate(countryCode);
  const subtotal = ocrData.total - (ocrData.tax || 0);
  const calculatedVAT = subtotal * expectedVATRate;
  const actualVAT = ocrData.tax || 0;
  
  const vatDifference = Math.abs(calculatedVAT - actualVAT);
  const threshold = actualVAT * 0.05; // 5% tolerance
  
  if (vatDifference > threshold) {
    result.compliant = false;
    result.alerts.push(`VAT amount doesn't match expected ${countryCode} VAT rate of ${(expectedVATRate * 100).toFixed(2)}%`);
    result.suggestions.push({
      field: 'tax',
      expected_value: calculatedVAT,
      actual_value: actualVAT,
      message: `Expected VAT: €${calculatedVAT.toFixed(2)} based on ${countryCode} VAT rate`
    });
  }
  
  return result;
}

module.exports = {
  validateEUReceipt,
  validateVATFormat,
  getCountryVATRate,
  validateCountryVAT
};
