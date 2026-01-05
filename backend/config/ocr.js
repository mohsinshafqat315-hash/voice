// OCR configuration - Tesseract/alternative OCR engine setup
// Engine selection, language packs, accuracy settings

/**
 * Get OCR configuration
 * @returns {Object} OCR config
 */
function getOCRConfig() {
  return {
    provider: process.env.OCR_CONFIG || 'tesseract',
    language: process.env.OCR_LANGUAGE || 'eng',
    psm: parseInt(process.env.OCR_PSM) || 6, // Page segmentation mode
    oem: parseInt(process.env.OCR_OEM) || 3, // OCR Engine mode
    confidenceThreshold: parseFloat(process.env.OCR_CONFIDENCE_THRESHOLD) || 0.5,
    timeout: parseInt(process.env.OCR_TIMEOUT) || 60000,
    // Google Vision config
    googleProjectId: process.env.GOOGLE_PROJECT_ID,
    googleKeyFile: process.env.GOOGLE_KEY_FILE,
    // AWS Textract config
    awsRegion: process.env.AWS_REGION,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  };
}

/**
 * Get OCR adapter based on provider
 * @param {string} provider - OCR provider name
 * @returns {Object} OCR adapter
 */
function getOCRAdapter(provider = null) {
  const config = getOCRConfig();
  const selectedProvider = provider || config.provider;
  
  switch (selectedProvider.toLowerCase()) {
    case 'tesseract':
      return require('../../ocr/engines/tesseract');
    case 'google':
    case 'google-vision':
      // return require('../../ocr/engines/googleVision');
      throw new Error('Google Vision adapter not implemented yet');
    case 'aws':
    case 'textract':
      // return require('../../ocr/engines/awsTextract');
      throw new Error('AWS Textract adapter not implemented yet');
    default:
      throw new Error(`Unsupported OCR provider: ${selectedProvider}`);
  }
}

/**
 * Validate OCR configuration
 * @returns {Object} Validation result
 */
function validateOCRConfig() {
  const config = getOCRConfig();
  const issues = [];
  
  if (config.provider === 'google' && !config.googleProjectId) {
    issues.push('Google Vision requires GOOGLE_PROJECT_ID');
  }
  
  if (config.provider === 'aws' && !config.awsRegion) {
    issues.push('AWS Textract requires AWS_REGION');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

module.exports = {
  getOCRConfig,
  getOCRAdapter,
  validateOCRConfig
};
