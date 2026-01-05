// US federal tax rules - IRS regulations and guidelines
// Federal tax brackets, deduction rules, reporting requirements

/**
 * Validate federal tax compliance
 * @param {Object} receiptData - Receipt data
 * @returns {Object} Compliance result
 */
function validateFederalTax(receiptData) {
  const result = {
    compliant: true,
    issues: [],
    deductions: [],
    taxable: true
  };
  
  // Federal tax rules
  const total = receiptData.total || 0;
  
  // Business expense deduction limits
  if (receiptData.category === 'Meals & Entertainment') {
    // Meals are 50% deductible
    result.deductions.push({
      type: 'meals',
      amount: total * 0.5,
      reason: 'Meals are 50% deductible per IRS rules'
    });
  }
  
  // Travel expenses are fully deductible
  if (receiptData.category === 'Travel') {
    result.deductions.push({
      type: 'travel',
      amount: total,
      reason: 'Travel expenses are fully deductible'
    });
  }
  
  // Office supplies are fully deductible
  if (receiptData.category === 'Office Supplies') {
    result.deductions.push({
      type: 'office_supplies',
      amount: total,
      reason: 'Office supplies are fully deductible'
    });
  }
  
  // Validate receipt has required information for deduction
  if (!receiptData.vendor || !receiptData.date || !receiptData.total) {
    result.compliant = false;
    result.issues.push('Missing required information for tax deduction');
  }
  
  // Validate date is within tax year
  const receiptDate = new Date(receiptData.date);
  const currentYear = new Date().getFullYear();
  if (receiptDate.getFullYear() < currentYear - 1) {
    result.issues.push('Receipt date is more than 1 year old');
  }
  
  return result;
}

/**
 * Get federal tax bracket for income
 * @param {number} income - Annual income
 * @returns {Object} Tax bracket information
 */
function getFederalTaxBracket(income) {
  const brackets = [
    { min: 0, max: 10275, rate: 0.10 },
    { min: 10275, max: 41775, rate: 0.12 },
    { min: 41775, max: 89450, rate: 0.22 },
    { min: 89450, max: 190750, rate: 0.24 },
    { min: 190750, max: 364200, rate: 0.32 },
    { min: 364200, max: 462500, rate: 0.35 },
    { min: 462500, max: Infinity, rate: 0.37 }
  ];
  
  for (const bracket of brackets) {
    if (income >= bracket.min && income < bracket.max) {
      return bracket;
    }
  }
  
  return brackets[brackets.length - 1];
}

/**
 * Calculate federal tax deduction
 * @param {Object} receiptData - Receipt data
 * @returns {number} Deductible amount
 */
function calculateFederalDeduction(receiptData) {
  const category = receiptData.category || 'Other';
  const total = receiptData.total || 0;
  
  // Deduction percentages by category
  const deductionRates = {
    'Meals & Entertainment': 0.5,
    'Travel': 1.0,
    'Office Supplies': 1.0,
    'Software & Subscriptions': 1.0,
    'Professional Services': 1.0,
    'Utilities': 1.0,
    'Marketing & Advertising': 1.0,
    'Equipment': 1.0,
    'Training & Education': 1.0,
    'Insurance': 1.0,
    'Rent': 1.0,
    'Other': 1.0
  };
  
  const rate = deductionRates[category] || 1.0;
  return total * rate;
}

module.exports = {
  validateFederalTax,
  getFederalTaxBracket,
  calculateFederalDeduction
};
