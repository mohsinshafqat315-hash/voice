// Risk scoring utility - calculates risk scores for receipts
// Analyzes patterns, flags anomalies, assigns risk levels (low, medium, high)

/**
 * Calculate risk score (0-100) based on various factors
 * @param {Object} factors - Object containing validation, duplicate, tax, and date checks
 * @returns {number} Risk score from 0 to 100
 */
function calculateRiskScore(factors) {
  let score = 0;
  const { validationResult, duplicateCheck, taxDiscrepancy, dateAnomalies, ocrData } = factors;
  
  // Missing required fields: 10-20 points per field
  validationResult.missing.forEach(field => {
    const fieldScores = {
      vendor: 15,
      date: 15,
      total: 20,
      currency: 15,
      invoice_number: 10
    };
    score += fieldScores[field] || 10;
  });
  
  // Validation issues: 5-15 points per issue
  validationResult.issues.forEach(issue => {
    if (issue.includes('VAT_ID')) {
      score += 15; // EU compliance is important
    } else if (issue.includes('currency')) {
      score += 10;
    } else {
      score += 5;
    }
  });
  
  // Duplicate invoice number: 30 points
  if (duplicateCheck.isDuplicate) {
    score += 30;
  }
  
  // Tax discrepancy: 20 points if significant
  if (taxDiscrepancy.hasDiscrepancy) {
    const discrepancyRatio = taxDiscrepancy.totalDifference / (taxDiscrepancy.calculatedTotal || 1);
    if (discrepancyRatio > 0.05) {
      score += 20; // More than 5% difference
    } else if (discrepancyRatio > 0.01) {
      score += 10; // Between 1-5% difference
    } else {
      score += 5; // Less than 1% difference (minor)
    }
  }
  
  // Date anomalies: 10 points
  if (dateAnomalies.hasAnomaly) {
    if (dateAnomalies.type === 'future') {
      score += 15; // Future dates are more suspicious
    } else if (dateAnomalies.type === 'old') {
      score += 10;
    } else if (dateAnomalies.type === 'invalid') {
      score += 15;
    }
  }
  
  // Additional risk factors
  // Missing invoice number
  if (!ocrData.invoice_number || ocrData.invoice_number.trim() === '') {
    score += 5;
  }
  
  // Missing line items
  if (!ocrData.line_items || ocrData.line_items.length === 0) {
    score += 5;
  }
  
  // Very high or very low amounts (potential outliers)
  if (ocrData.total) {
    if (ocrData.total > 10000) {
      score += 5; // High-value transactions need extra scrutiny
    }
    if (ocrData.total < 0.01) {
      score += 10; // Suspiciously low amounts
    }
  }
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Get risk level category based on score
 * @param {number} score - Risk score (0-100)
 * @returns {string} Risk level: 'Low', 'Medium', or 'High'
 */
function getRiskLevel(score) {
  if (score <= 30) return 'Low';
  if (score <= 60) return 'Medium';
  return 'High';
}

/**
 * Calculate risk breakdown by category
 * @param {Object} factors - Risk factors
 * @returns {Object} Detailed risk breakdown
 */
function getRiskBreakdown(factors) {
  const breakdown = {
    missing_fields: 0,
    validation_issues: 0,
    duplicates: 0,
    tax_discrepancies: 0,
    date_anomalies: 0,
    other: 0
  };
  
  const { validationResult, duplicateCheck, taxDiscrepancy, dateAnomalies, ocrData } = factors;
  
  // Calculate points per category
  validationResult.missing.forEach(() => {
    breakdown.missing_fields += 10;
  });
  
  validationResult.issues.forEach(() => {
    breakdown.validation_issues += 5;
  });
  
  if (duplicateCheck.isDuplicate) {
    breakdown.duplicates = 30;
  }
  
  if (taxDiscrepancy.hasDiscrepancy) {
    breakdown.tax_discrepancies = 20;
  }
  
  if (dateAnomalies.hasAnomaly) {
    breakdown.date_anomalies = 10;
  }
  
  // Other factors
  if (!ocrData.invoice_number) {
    breakdown.other += 5;
  }
  
  return breakdown;
}

module.exports = {
  calculateRiskScore,
  getRiskLevel,
  getRiskBreakdown
};
