// Main entry point for AI module
// Exports the main receipt processing function and utilities

const { processReceipt } = require('./processReceipt');
const { calculateRiskScore, getRiskLevel } = require('./utils/riskScoring');
const { validateTaxCompliance } = require('./utils/taxCalculator');
const { checkDuplicates } = require('./utils/duplicateDetection');

/**
 * Process a single receipt
 * @param {Object} ocrData - Structured receipt data from OCR
 * @param {Array} existingReceipts - Optional array of existing receipts for duplicate checking
 * @returns {Promise<Object>} Risk analysis result
 */
async function analyzeReceipt(ocrData, existingReceipts = []) {
  return await processReceipt(ocrData, existingReceipts);
}

/**
 * Batch process multiple receipts
 * @param {Array} receipts - Array of OCR receipt data
 * @param {Array} existingReceipts - Optional array of existing receipts
 * @returns {Promise<Array>} Array of risk analysis results
 */
async function batchAnalyzeReceipts(receipts, existingReceipts = []) {
  const results = [];
  
  for (let i = 0; i < receipts.length; i++) {
    const receipt = receipts[i];
    // Include previously processed receipts in this batch for duplicate checking
    const allExisting = [...existingReceipts, ...receipts.slice(0, i)];
    const result = await processReceipt(receipt, allExisting);
    results.push({
      receipt_index: i,
      receipt_data: receipt,
      analysis: result
    });
  }
  
  return results;
}

module.exports = {
  analyzeReceipt,
  batchAnalyzeReceipts,
  processReceipt,
  calculateRiskScore,
  getRiskLevel,
  validateTaxCompliance,
  checkDuplicates
};

