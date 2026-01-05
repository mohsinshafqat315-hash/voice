// Tesseract OCR engine configuration
// Tesseract setup, language packs, accuracy optimization, preprocessing

const Tesseract = require('tesseract.js');
const { preprocessImage } = require('../utils/preprocessor');

/**
 * Extract text from image using Tesseract OCR
 * @param {string} filePath - Path to image file
 * @param {Object} options - OCR options
 * @returns {Promise<Object>} Extracted text and confidence
 */
async function extractText(filePath, options = {}) {
  try {
    // Preprocess image for better OCR accuracy
    const processedImage = await preprocessImage(filePath, options);
    
    // Configure Tesseract
    const language = options.language || 'eng';
    const config = {
      logger: (info) => {
        if (options.verbose) {
          console.log('Tesseract:', info);
        }
      }
    };
    
    // Run OCR
    const { data } = await Tesseract.recognize(
      processedImage || filePath,
      language,
      config
    );
    
    return {
      text: data.text.trim(),
      confidence: data.confidence / 100, // Normalize to 0-1
      words: data.words || []
    };
  } catch (error) {
    throw new Error(`Tesseract OCR failed: ${error.message}`);
  }
}

/**
 * Extract text with multiple language support
 * @param {string} filePath - Path to image file
 * @param {Array<string>} languages - Language codes
 * @param {Object} options - OCR options
 * @returns {Promise<Object>} Extracted text
 */
async function extractTextMultiLang(filePath, languages = ['eng'], options = {}) {
  const langString = languages.join('+');
  return extractText(filePath, { ...options, language: langString });
}

module.exports = {
  extractText,
  extractTextMultiLang
};
