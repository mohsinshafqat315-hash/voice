// OCR postprocessing cleanup - text cleaning utilities
// Removes noise, normalizes text, fixes common OCR errors

/**
 * Clean OCR text
 * @param {string} text - Raw OCR text
 * @returns {string} Cleaned text
 */
function cleanText(text) {
  if (!text || typeof text !== 'string') return '';
  
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Fix common OCR errors
    .replace(/0(?=\d)/g, 'O') // 0 -> O in certain contexts
    .replace(/[|]/g, 'I') // | -> I
    .replace(/[`'']/g, "'") // Normalize quotes
    .replace(/[""]/g, '"') // Normalize double quotes
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Trim
    .trim();
}

/**
 * Fix common OCR number errors
 * @param {string} text - Text with potential number errors
 * @returns {string} Fixed text
 */
function fixNumberErrors(text) {
  // Common OCR errors: O -> 0, l -> 1, I -> 1
  return text
    .replace(/\bO(?=\d)/g, '0') // O before digits -> 0
    .replace(/(?<=\d)l\b/g, '1') // l after digits -> 1
    .replace(/(?<=\d)I(?=\d)/g, '1'); // I between digits -> 1
}

/**
 * Normalize currency symbols
 * @param {string} text - Text with currency symbols
 * @returns {string} Normalized text
 */
function normalizeCurrency(text) {
  return text
    .replace(/[$]/g, '$')
    .replace(/[€]/g, '€')
    .replace(/[£]/g, '£')
    .replace(/Rs\.?/gi, '₨')
    .replace(/PKR/gi, '₨');
}

module.exports = {
  cleanText,
  fixNumberErrors,
  normalizeCurrency
};

