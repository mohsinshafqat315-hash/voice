// Duplicate detection utility - identifies duplicate receipts
// Compares receipts by amount, date, merchant, uses fuzzy matching algorithms

/**
 * Check for duplicate receipts
 * @param {Object} ocrData - Current receipt data
 * @param {Array} existingReceipts - Array of existing receipts
 * @returns {Object} Duplicate check result
 */
function checkDuplicates(ocrData, existingReceipts = []) {
  const result = {
    isDuplicate: false,
    duplicateInvoiceNumber: null,
    duplicateDate: null,
    similarityScore: 0,
    matches: []
  };
  
  if (!existingReceipts || existingReceipts.length === 0) {
    return result;
  }
  
  // Check for exact invoice number match
  if (ocrData.invoice_number) {
    const invoiceMatch = existingReceipts.find(receipt => 
      receipt.invoice_number && 
      receipt.invoice_number.trim().toLowerCase() === ocrData.invoice_number.trim().toLowerCase()
    );
    
    if (invoiceMatch) {
      result.isDuplicate = true;
      result.duplicateInvoiceNumber = invoiceMatch.invoice_number;
      result.duplicateDate = invoiceMatch.date;
      result.similarityScore = 100;
      result.matches.push({
        type: 'exact_invoice_number',
        receipt: invoiceMatch
      });
      return result;
    }
  }
  
  // Check for similar receipts (same vendor, same date, similar amount)
  const similarReceipts = existingReceipts.filter(receipt => {
    // Same vendor (fuzzy match)
    const vendorMatch = receipt.vendor && ocrData.vendor &&
      receipt.vendor.trim().toLowerCase() === ocrData.vendor.trim().toLowerCase();
    
    // Same date
    const dateMatch = receipt.date === ocrData.date;
    
    // Similar amount (within 1% or $0.10)
    const amountDifference = Math.abs((receipt.total || 0) - (ocrData.total || 0));
    const amountThreshold = Math.max((ocrData.total || 0) * 0.01, 0.10);
    const amountMatch = amountDifference <= amountThreshold;
    
    // If all three match, it's likely a duplicate
    return vendorMatch && dateMatch && amountMatch;
  });
  
  if (similarReceipts.length > 0) {
    // Calculate similarity score
    const bestMatch = similarReceipts[0];
    const amountDifference = Math.abs((bestMatch.total || 0) - (ocrData.total || 0));
    const amountSimilarity = 100 - (amountDifference / (ocrData.total || 1)) * 100;
    
    result.isDuplicate = true;
    result.duplicateInvoiceNumber = bestMatch.invoice_number || 'N/A';
    result.duplicateDate = bestMatch.date;
    result.similarityScore = Math.max(80, amountSimilarity); // Minimum 80% for similar match
    result.matches = similarReceipts.map(receipt => ({
      type: 'similar_receipt',
      receipt: receipt,
      similarity: calculateSimilarity(ocrData, receipt)
    }));
  }
  
  return result;
}

/**
 * Calculate similarity score between two receipts (0-100)
 * @param {Object} receipt1 - First receipt
 * @param {Object} receipt2 - Second receipt
 * @returns {number} Similarity score
 */
function calculateSimilarity(receipt1, receipt2) {
  let score = 0;
  let factors = 0;
  
  // Vendor match (40% weight)
  if (receipt1.vendor && receipt2.vendor) {
    factors++;
    if (receipt1.vendor.trim().toLowerCase() === receipt2.vendor.trim().toLowerCase()) {
      score += 40;
    } else {
      // Fuzzy match
      const similarity = fuzzyStringMatch(receipt1.vendor, receipt2.vendor);
      score += similarity * 40;
    }
  }
  
  // Date match (20% weight)
  if (receipt1.date && receipt2.date) {
    factors++;
    if (receipt1.date === receipt2.date) {
      score += 20;
    }
  }
  
  // Amount match (30% weight)
  if (receipt1.total && receipt2.total) {
    factors++;
    const amountDifference = Math.abs(receipt1.total - receipt2.total);
    const amountSimilarity = 1 - Math.min(amountDifference / receipt1.total, 1);
    score += amountSimilarity * 30;
  }
  
  // Invoice number match (10% weight)
  if (receipt1.invoice_number && receipt2.invoice_number) {
    factors++;
    if (receipt1.invoice_number.trim().toLowerCase() === receipt2.invoice_number.trim().toLowerCase()) {
      score += 10;
    }
  }
  
  return Math.min(100, score);
}

/**
 * Simple fuzzy string matching (Levenshtein distance based)
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity score (0-1)
 */
function fuzzyStringMatch(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.trim().toLowerCase();
  const s2 = str2.trim().toLowerCase();
  
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Simple character overlap
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) {
      matches++;
    }
  }
  
  return matches / longer.length;
}

/**
 * Batch check for duplicates across multiple receipts
 * @param {Array} newReceipts - Array of new receipts to check
 * @param {Array} existingReceipts - Array of existing receipts
 * @returns {Array} Array of duplicate check results
 */
function batchCheckDuplicates(newReceipts, existingReceipts = []) {
  return newReceipts.map(receipt => checkDuplicates(receipt, existingReceipts));
}

module.exports = {
  checkDuplicates,
  calculateSimilarity,
  batchCheckDuplicates
};
