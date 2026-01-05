// Image preprocessing utility - prepares images for OCR
// Image enhancement, noise reduction, contrast adjustment, rotation correction

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Preprocess image for better OCR accuracy
 * @param {string} filePath - Path to original image
 * @param {Object} options - Preprocessing options
 * @returns {Promise<string>} Path to processed image
 */
async function preprocessImage(filePath, options = {}) {
  try {
    const outputPath = path.join(
      path.dirname(filePath),
      'processed_' + path.basename(filePath)
    );
    
    // Read image
    let image = sharp(filePath);
    
    // Get metadata
    const metadata = await image.metadata();
    
    // Apply preprocessing
    image = image
      .greyscale() // Convert to grayscale for better OCR
      .normalize() // Enhance contrast
      .sharpen() // Sharpen edges
      .threshold(128); // Binarize (optional, can improve OCR)
    
    // Resize if too large (OCR works better on reasonable sizes)
    if (metadata.width > 2000 || metadata.height > 2000) {
      image = image.resize(2000, 2000, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Save processed image
    await image.toFile(outputPath);
    
    return outputPath;
  } catch (error) {
    // If preprocessing fails, return original path
    console.warn('Image preprocessing failed, using original:', error.message);
    return filePath;
  }
}

module.exports = {
  preprocessImage
};
