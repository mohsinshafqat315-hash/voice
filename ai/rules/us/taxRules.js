// US tax rules configuration - federal and state tax regulations
// Tax rates, deduction limits, business expense categories, compliance rules

const { validateFederalTax, calculateFederalDeduction } = require('./federalRules');
const { validateStateTax, getStateTaxRate } = require('./stateRules');

/**
 * Validate US receipt for tax compliance
 * @param {Object} receiptData - Receipt data
 * @param {string} stateCode - Optional state code
 * @returns {Object} Validation result
 */
function validateUSTax(receiptData, stateCode = null) {
  const result = {
    compliant: true,
    alerts: [],
    suggestions: [],
    requiresReview: false,
    federal: {},
    state: {}
  };
  
  // Validate federal tax
  result.federal = validateFederalTax(receiptData);
  if (!result.federal.compliant) {
    result.compliant = false;
    result.alerts.push(...result.federal.issues);
  }
  
  // Validate state tax if state code provided
  if (stateCode) {
    result.state = validateStateTax(receiptData, stateCode);
    if (!result.state.compliant) {
      result.compliant = false;
      result.alerts.push(...result.state.issues);
    }
  } else if (receiptData.currency === 'USD') {
    result.suggestions.push('State code not provided. Unable to validate state sales tax.');
  }
  
  // Check for missing required fields
  if (!receiptData.vendor) {
    result.compliant = false;
    result.alerts.push('Missing vendor name');
  }
  
  if (!receiptData.date) {
    result.compliant = false;
    result.alerts.push('Missing transaction date');
  }
  
  if (!receiptData.total || receiptData.total <= 0) {
    result.compliant = false;
    result.alerts.push('Invalid or missing total amount');
  }
  
  // Validate tax rate is reasonable for US (0-15%)
  if (receiptData.tax && receiptData.total) {
    const taxRate = receiptData.tax / (receiptData.total - receiptData.tax);
    if (taxRate > 0.15) {
      result.compliant = false;
      result.requiresReview = true;
      result.alerts.push(`Unusually high tax rate: ${(taxRate * 100).toFixed(2)}%. US sales tax typically ranges from 0-15%.`);
    }
  }
  
  return result;
}

/**
 * Calculate total tax deduction for US receipt
 * @param {Object} receiptData - Receipt data
 * @param {string} stateCode - State code
 * @returns {number} Total deductible amount
 */
function calculateTotalDeduction(receiptData, stateCode = null) {
  const federalDeduction = calculateFederalDeduction(receiptData);
  
  // State deductions would be calculated here if needed
  // For now, return federal deduction
  
  return federalDeduction;
}

module.exports = {
  validateUSTax,
  calculateTotalDeduction,
  validateFederalTax,
  validateStateTax,
  getStateTaxRate
};
