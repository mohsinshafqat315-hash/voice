// OCR postprocessing - main entry point
// Coordinates all postprocessing steps

const { cleanText } = require('./cleanup');
const { validateConfidence, postprocessData } = require('../../utils/postprocessor');

/**
 * Post-process OCR result
 * @param {Object} ocrResult - Raw OCR result
 * @returns {Object} Processed result
 */
function postprocessOCR(ocrResult) {
  // Clean text
  const cleanedText = cleanText(ocrResult.text || '');
  
  // Validate confidence
  const confidence = ocrResult.confidence || 0;
  const isValid = validateConfidence(confidence);
  
  // Post-process data
  const processedData = postprocessData(ocrResult.data || {}, confidence);
  
  return {
    text: cleanedText,
    confidence,
    isValid,
    data: processedData,
    raw: ocrResult
  };
}

module.exports = {
  postprocessOCR
};

