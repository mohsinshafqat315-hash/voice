// US state tax rules - state-specific tax regulations
// State tax rates, local tax rules, state-specific deductions

const STATE_TAX_RATES = {
  'AL': 0.04, 'AK': 0.00, 'AZ': 0.056, 'AR': 0.065, 'CA': 0.0725,
  'CO': 0.029, 'CT': 0.0635, 'DE': 0.00, 'FL': 0.06, 'GA': 0.04,
  'HI': 0.04, 'ID': 0.06, 'IL': 0.0625, 'IN': 0.07, 'IA': 0.06,
  'KS': 0.065, 'KY': 0.06, 'LA': 0.0445, 'ME': 0.055, 'MD': 0.06,
  'MA': 0.0625, 'MI': 0.06, 'MN': 0.06875, 'MS': 0.07, 'MO': 0.04225,
  'MT': 0.00, 'NE': 0.055, 'NV': 0.0685, 'NH': 0.00, 'NJ': 0.06625,
  'NM': 0.05125, 'NY': 0.08, 'NC': 0.0475, 'ND': 0.05, 'OH': 0.0575,
  'OK': 0.045, 'OR': 0.00, 'PA': 0.06, 'RI': 0.07, 'SC': 0.06,
  'SD': 0.045, 'TN': 0.07, 'TX': 0.0625, 'UT': 0.061, 'VT': 0.06,
  'VA': 0.053, 'WA': 0.065, 'WV': 0.06, 'WI': 0.05, 'WY': 0.04,
  'DC': 0.06
};

/**
 * Get state sales tax rate
 * @param {string} stateCode - Two-letter state code
 * @returns {number} Tax rate (0-1)
 */
function getStateTaxRate(stateCode) {
  return STATE_TAX_RATES[stateCode?.toUpperCase()] || 0.06;
}

/**
 * Validate state tax compliance
 * @param {Object} receiptData - Receipt data
 * @param {string} stateCode - State code
 * @returns {Object} Compliance result
 */
function validateStateTax(receiptData, stateCode) {
  const result = {
    compliant: true,
    issues: [],
    expectedTax: 0,
    actualTax: receiptData.tax || 0
  };
  
  if (!stateCode) {
    result.issues.push('State code not provided');
    return result;
  }
  
  const expectedRate = getStateTaxRate(stateCode);
  const subtotal = (receiptData.total || 0) - (receiptData.tax || 0);
  result.expectedTax = subtotal * expectedRate;
  
  const taxDifference = Math.abs(result.expectedTax - result.actualTax);
  const threshold = result.actualTax * 0.05; // 5% tolerance
  
  if (taxDifference > threshold && taxDifference > 0.01) {
    result.compliant = false;
    result.issues.push(
      `Tax amount (${result.actualTax.toFixed(2)}) doesn't match expected ${stateCode} rate ` +
      `(${(expectedRate * 100).toFixed(2)}%). Expected: ${result.expectedTax.toFixed(2)}`
    );
  }
  
  // Check for tax-exempt states
  const taxExemptStates = ['AK', 'DE', 'MT', 'NH', 'OR'];
  if (taxExemptStates.includes(stateCode.toUpperCase()) && result.actualTax > 0) {
    result.issues.push(`${stateCode} is a tax-exempt state, but tax was charged`);
  }
  
  return result;
}

/**
 * Get state-specific deduction rules
 * @param {string} stateCode - State code
 * @param {string} category - Expense category
 * @returns {Object} Deduction rules
 */
function getStateDeductionRules(stateCode, category) {
  const rules = {
    deductible: true,
    rate: 1.0,
    limits: null
  };
  
  // California specific rules
  if (stateCode === 'CA') {
    if (category === 'Meals & Entertainment') {
      rules.rate = 0.5; // 50% deductible
    }
  }
  
  // New York specific rules
  if (stateCode === 'NY') {
    if (category === 'Meals & Entertainment') {
      rules.rate = 0.5;
      rules.limits = { maxPerDay: 50 }; // Example limit
    }
  }
  
  return rules;
}

module.exports = {
  getStateTaxRate,
  validateStateTax,
  getStateDeductionRules,
  STATE_TAX_RATES
};
