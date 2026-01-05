// OCR postprocessing utility - cleans and validates OCR output
// Text cleaning, validation, confidence scoring, error correction

/**
 * Clean OCR text output
 * @param {string} text - Raw OCR text
 * @returns {string} Cleaned text
 */
function cleanText(text) {
  if (!text) return '';
  
  return text
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .replace(/\n{3,}/g, '\n\n') // Multiple newlines to double
    .trim();
}

/**
 * Validate OCR confidence
 * @param {number} confidence - Confidence score (0-1)
 * @returns {boolean} Whether confidence is acceptable
 */
function validateConfidence(confidence) {
  return confidence >= 0.5; // Minimum 50% confidence
}

/**
 * Post-process extracted data
 * @param {Object} data - Extracted receipt data
 * @param {number} confidence - OCR confidence
 * @returns {Object} Validated and cleaned data
 */
function postprocessData(data, confidence) {
  // Validate required fields
  if (!data.vendor || data.vendor === 'Unknown Vendor') {
    data.requiresManualReview = true;
  }
  
  if (!data.date || !isValidDate(data.date)) {
    data.requiresManualReview = true;
  }
  
  if (!data.total || data.total <= 0) {
    data.requiresManualReview = true;
  }
  
  // Add confidence flag
  data.lowConfidence = !validateConfidence(confidence);
  
  return data;
}

/**
 * Validate date format
 */
function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

module.exports = {
  cleanText,
  validateConfidence,
  postprocessData
};
