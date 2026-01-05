// Tax calculator utility - calculates tax amounts and compliance
// Applies tax rules, calculates deductions, validates tax amounts

/**
 * Validate tax compliance for receipt
 * @param {Object} ocrData - Receipt data
 * @returns {Object} Compliance validation result
 */
function validateTaxCompliance(ocrData) {
  const result = {
    compliant: true,
    issues: [],
    calculatedTax: 0,
    expectedTax: 0
  };
  
  if (!ocrData.line_items || ocrData.line_items.length === 0) {
    return result; // No line items to validate
  }
  
  // Calculate expected tax from line items
  result.calculatedTax = ocrData.line_items.reduce((sum, item) => {
    return sum + (item.tax || 0);
  }, 0);
  
  // Get reported tax
  const reportedTax = ocrData.tax || 0;
  result.expectedTax = reportedTax;
  
  // Check for tax discrepancy
  const taxDifference = Math.abs(result.calculatedTax - reportedTax);
  const threshold = Math.max(reportedTax * 0.05, 0.01); // 5% or $0.01
  
  if (taxDifference > threshold) {
    result.compliant = false;
    result.issues.push({
      type: 'tax_mismatch',
      message: `Tax discrepancy: Calculated ${result.calculatedTax.toFixed(2)} vs Reported ${reportedTax.toFixed(2)}`,
      difference: taxDifference
    });
  }
  
  // Validate line item tax calculations
  ocrData.line_items.forEach((item, index) => {
    const itemTotal = (item.quantity || 1) * (item.unit_price || 0);
    const itemTax = item.tax || 0;
    
    // Check if tax is reasonable (typically 0-30% of item total)
    if (itemTax > itemTotal * 0.3) {
      result.compliant = false;
      result.issues.push({
        type: 'unusual_tax_rate',
        message: `Line item ${index + 1} has unusually high tax rate`,
        itemIndex: index,
        taxRate: (itemTax / itemTotal) * 100
      });
    }
  });
  
  return result;
}

/**
 * Calculate tax rate from receipt data
 * @param {Object} ocrData - Receipt data
 * @returns {number} Tax rate as percentage
 */
function calculateTaxRate(ocrData) {
  if (!ocrData.total || ocrData.total === 0) {
    return 0;
  }
  
  const subtotal = ocrData.total - (ocrData.tax || 0);
  if (subtotal === 0) {
    return 0;
  }
  
  return ((ocrData.tax || 0) / subtotal) * 100;
}

/**
 * Validate tax rate is within expected range for currency
 * @param {Object} ocrData - Receipt data
 * @returns {Object} Validation result
 */
function validateTaxRate(ocrData) {
  const taxRate = calculateTaxRate(ocrData);
  const result = {
    valid: true,
    taxRate: taxRate,
    expectedRange: { min: 0, max: 30 },
    message: ''
  };
  
  // Expected tax rate ranges by currency
  const expectedRanges = {
    USD: { min: 0, max: 15 }, // US sales tax typically 0-15%
    EUR: { min: 0, max: 27 }, // EU VAT typically 0-27%
    PKR: { min: 0, max: 20 }  // Pakistan GST typically 0-20%
  };
  
  const range = expectedRanges[ocrData.currency] || { min: 0, max: 30 };
  result.expectedRange = range;
  
  if (taxRate < range.min || taxRate > range.max) {
    result.valid = false;
    result.message = `Tax rate ${taxRate.toFixed(2)}% is outside expected range (${range.min}-${range.max}%) for ${ocrData.currency}`;
  }
  
  return result;
}

module.exports = {
  validateTaxCompliance,
  calculateTaxRate,
  validateTaxRate
};
