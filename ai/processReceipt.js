// Main AI receipt processor - orchestrates risk analysis, compliance checks, and suggestions
// Takes OCR JSON input and returns comprehensive risk analysis

const { calculateRiskScore } = require('./utils/riskScoring');
const { validateTaxCompliance } = require('./utils/taxCalculator');
const { checkDuplicates } = require('./utils/duplicateDetection');
const { validateUSReceipt } = require('./rules/us/taxRules');
const { validateEUReceipt } = require('./rules/eu/vatRules');
const { checkTaxCompliance } = require('./prompts/taxCompliance');

/**
 * Main function to process receipt data from OCR
 * @param {Object} ocrData - Structured receipt data from OCR
 * @param {Array} existingReceipts - Array of existing receipts for duplicate checking
 * @returns {Object} Risk analysis with score, level, alerts, and suggestions
 */
async function processReceipt(ocrData, existingReceipts = []) {
  try {
    // Step 1: Validate required fields
    const validationResult = validateRequiredFields(ocrData);
    
    // Step 2: Check for duplicates
    const duplicateCheck = checkDuplicates(ocrData, existingReceipts);
    
    // Step 3: Calculate tax discrepancies
    const taxDiscrepancy = calculateTaxDiscrepancy(ocrData);
    
    // Step 4: Check date anomalies
    const dateAnomalies = checkDateAnomalies(ocrData.date);
    
    // Step 5: Calculate risk score
    const riskScore = calculateRiskScore({
      validationResult,
      duplicateCheck,
      taxDiscrepancy,
      dateAnomalies,
      ocrData
    });
    
    // Step 6: Determine risk level
    const riskLevel = getRiskLevel(riskScore);
    
    // Step 7: Generate alerts
    const alerts = generateAlerts({
      validationResult,
      duplicateCheck,
      taxDiscrepancy,
      dateAnomalies,
      ocrData
    });
    
    // Step 8: Generate suggestions
    const suggestedCorrections = generateSuggestions({
      validationResult,
      duplicateCheck,
      taxDiscrepancy,
      dateAnomalies,
      ocrData
    });
    
    // Step 9: Validate compliance (US/EU specific)
    const complianceResult = await validateCompliance(ocrData);
    
    // Step 10: Calculate confidence score
    const confidenceScore = calculateConfidenceScore({
      validationResult,
      taxDiscrepancy,
      complianceResult
    });
    
    // Combine all results
    return {
      risk_score: riskScore,
      risk_level: riskLevel,
      alerts: [...alerts, ...complianceResult.alerts],
      suggested_corrections: [...suggestedCorrections, ...complianceResult.suggestions],
      confidence_score: confidenceScore,
      compliance_status: complianceResult.status,
      requires_review: riskScore > 60 || complianceResult.requiresReview
    };
  } catch (error) {
    return {
      risk_score: 100,
      risk_level: 'High',
      alerts: [`Error processing receipt: ${error.message}`],
      suggested_corrections: [],
      confidence_score: 0,
      compliance_status: 'error',
      requires_review: true
    };
  }
}

/**
 * Validate required fields in OCR data
 */
function validateRequiredFields(ocrData) {
  const missing = [];
  const issues = [];
  
  if (!ocrData.vendor || ocrData.vendor.trim() === '') {
    missing.push('vendor');
  }
  
  if (!ocrData.date) {
    missing.push('date');
  } else if (!isValidDate(ocrData.date)) {
    issues.push('Invalid date format');
  }
  
  if (ocrData.total === undefined || ocrData.total === null) {
    missing.push('total');
  } else if (typeof ocrData.total !== 'number' || ocrData.total <= 0) {
    issues.push('Invalid total amount');
  }
  
  if (!ocrData.currency) {
    missing.push('currency');
  } else if (!['USD', 'EUR', 'PKR'].includes(ocrData.currency)) {
    issues.push('Unsupported currency');
  }
  
  // EU-specific: Check VAT_ID for EUR
  if (ocrData.currency === 'EUR' && (!ocrData.VAT_ID || ocrData.VAT_ID.trim() === '')) {
    issues.push('Missing VAT_ID for EU receipt');
  }
  
  return {
    missing,
    issues,
    isValid: missing.length === 0 && issues.length === 0
  };
}

/**
 * Calculate tax discrepancy between total and sum of line items
 */
function calculateTaxDiscrepancy(ocrData) {
  if (!ocrData.line_items || ocrData.line_items.length === 0) {
    return { hasDiscrepancy: false, difference: 0 };
  }
  
  const calculatedTotal = ocrData.line_items.reduce((sum, item) => {
    const itemTotal = (item.quantity || 1) * (item.unit_price || 0) + (item.tax || 0);
    return sum + itemTotal;
  }, 0);
  
  const calculatedTax = ocrData.line_items.reduce((sum, item) => sum + (item.tax || 0), 0);
  
  const totalDifference = Math.abs(ocrData.total - calculatedTotal);
  const taxDifference = Math.abs((ocrData.tax || 0) - calculatedTax);
  
  // Consider discrepancy if difference is more than 1% or $0.01
  const threshold = Math.max(ocrData.total * 0.01, 0.01);
  const hasDiscrepancy = totalDifference > threshold || taxDifference > threshold;
  
  return {
    hasDiscrepancy,
    totalDifference,
    taxDifference,
    calculatedTotal,
    calculatedTax
  };
}

/**
 * Check for date anomalies (future dates, very old dates)
 */
function checkDateAnomalies(dateString) {
  if (!dateString) {
    return { hasAnomaly: true, type: 'missing' };
  }
  
  const receiptDate = new Date(dateString);
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  
  if (isNaN(receiptDate.getTime())) {
    return { hasAnomaly: true, type: 'invalid' };
  }
  
  if (receiptDate > today) {
    return { hasAnomaly: true, type: 'future' };
  }
  
  if (receiptDate < oneYearAgo) {
    return { hasAnomaly: true, type: 'old' };
  }
  
  return { hasAnomaly: false };
}

/**
 * Get risk level based on score
 */
function getRiskLevel(score) {
  if (score <= 30) return 'Low';
  if (score <= 60) return 'Medium';
  return 'High';
}

/**
 * Generate alerts based on validation results
 */
function generateAlerts({ validationResult, duplicateCheck, taxDiscrepancy, dateAnomalies, ocrData }) {
  const alerts = [];
  
  // Missing fields alerts
  if (validationResult.missing.length > 0) {
    alerts.push(`Missing required fields: ${validationResult.missing.join(', ')}`);
  }
  
  // Validation issues
  validationResult.issues.forEach(issue => {
    if (issue.includes('VAT_ID')) {
      alerts.push('Add VAT ID for EU compliance.');
    } else {
      alerts.push(issue);
    }
  });
  
  // Duplicate alert
  if (duplicateCheck.isDuplicate) {
    alerts.push('Possible duplicate invoice detected.');
  }
  
  // Tax discrepancy alert
  if (taxDiscrepancy.hasDiscrepancy) {
    alerts.push('Check total vs line items, possible OCR error.');
  }
  
  // Date anomaly alerts
  if (dateAnomalies.hasAnomaly) {
    if (dateAnomalies.type === 'future') {
      alerts.push('Invoice date is in the future, please verify.');
    } else if (dateAnomalies.type === 'old') {
      alerts.push('Invoice date is more than 1 year old, please verify.');
    } else if (dateAnomalies.type === 'invalid') {
      alerts.push('Invalid invoice date format.');
    }
  }
  
  return alerts;
}

/**
 * Generate suggested corrections
 */
function generateSuggestions({ validationResult, duplicateCheck, taxDiscrepancy, dateAnomalies, ocrData }) {
  const suggestions = [];
  
  // Tax discrepancy suggestions
  if (taxDiscrepancy.hasDiscrepancy) {
    suggestions.push({
      field: 'total',
      current_value: ocrData.total,
      suggested_value: taxDiscrepancy.calculatedTotal,
      reason: 'Total calculated from line items differs from OCR total'
    });
    
    if (taxDiscrepancy.taxDifference > 0.01) {
      suggestions.push({
        field: 'tax',
        current_value: ocrData.tax || 0,
        suggested_value: taxDiscrepancy.calculatedTax,
        reason: 'Tax calculated from line items differs from OCR tax'
      });
    }
  }
  
  // Missing VAT_ID suggestion for EU
  if (ocrData.currency === 'EUR' && !ocrData.VAT_ID) {
    suggestions.push({
      field: 'VAT_ID',
      current_value: null,
      suggested_value: 'REQUIRED',
      reason: 'VAT ID is required for EU receipts'
    });
  }
  
  // Duplicate suggestion
  if (duplicateCheck.isDuplicate) {
    suggestions.push({
      action: 'review',
      reason: `Similar receipt found: Invoice #${duplicateCheck.duplicateInvoiceNumber} on ${duplicateCheck.duplicateDate}`,
      suggestion: 'Please verify if this is a duplicate or separate transaction'
    });
  }
  
  return suggestions;
}

/**
 * Validate compliance based on currency (US/EU)
 */
async function validateCompliance(ocrData) {
  const result = {
    status: 'compliant',
    alerts: [],
    suggestions: [],
    requiresReview: false
  };
  
  if (ocrData.currency === 'EUR') {
    const euResult = await validateEUReceipt(ocrData);
    result.status = euResult.compliant ? 'compliant' : 'non-compliant';
    result.alerts = euResult.alerts || [];
    result.suggestions = euResult.suggestions || [];
    result.requiresReview = euResult.requiresReview || false;
  } else if (ocrData.currency === 'USD') {
    const usResult = await validateUSReceipt(ocrData);
    result.status = usResult.compliant ? 'compliant' : 'non-compliant';
    result.alerts = usResult.alerts || [];
    result.suggestions = usResult.suggestions || [];
    result.requiresReview = usResult.requiresReview || false;
  }
  
  return result;
}

/**
 * Calculate confidence score (0-1)
 */
function calculateConfidenceScore({ validationResult, taxDiscrepancy, complianceResult }) {
  let confidence = 1.0;
  
  // Reduce confidence for missing fields
  confidence -= validationResult.missing.length * 0.15;
  
  // Reduce confidence for validation issues
  confidence -= validationResult.issues.length * 0.1;
  
  // Reduce confidence for tax discrepancies
  if (taxDiscrepancy.hasDiscrepancy) {
    const discrepancyRatio = Math.min(taxDiscrepancy.totalDifference / (taxDiscrepancy.calculatedTotal || 1), 0.5);
    confidence -= discrepancyRatio * 0.3;
  }
  
  // Reduce confidence for compliance issues
  if (complianceResult.status === 'non-compliant') {
    confidence -= 0.2;
  }
  
  return Math.max(0, Math.min(1, confidence));
}

/**
 * Validate date format (YYYY-MM-DD)
 */
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

module.exports = {
  processReceipt,
  validateRequiredFields,
  calculateTaxDiscrepancy,
  checkDateAnomalies
};

