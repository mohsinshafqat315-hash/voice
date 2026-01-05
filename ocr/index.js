// Main OCR entry point - provider-agnostic OCR adapter
// Supports Tesseract (MVP) with easy switching to Google Vision / AWS Textract

const tesseractOCR = require('./engines/tesseract');
const alternativeOCR = require('./engines/alternative');

/**
 * Process image/file and extract structured receipt data
 * @param {string} filePath - Path to uploaded file
 * @param {Object} options - OCR options (language, provider, etc.)
 * @returns {Promise<Object>} Structured receipt data
 */
async function processReceipt(filePath, options = {}) {
  const provider = options.provider || process.env.OCR_CONFIG || 'tesseract';
  
  try {
    let result;
    
    switch (provider.toLowerCase()) {
      case 'tesseract':
        result = await tesseractOCR.extractText(filePath, options);
        break;
      case 'google':
      case 'google-vision':
        result = await alternativeOCR.extractTextAlternative('google', filePath, options);
        break;
      case 'aws':
      case 'textract':
        result = await alternativeOCR.extractTextAlternative('aws', filePath, options);
        break;
      case 'azure':
      case 'azure-vision':
        result = await alternativeOCR.extractTextAlternative('azure', filePath, options);
        break;
      default:
        throw new Error(`Unsupported OCR provider: ${provider}`);
    }
    
    // Parse extracted text into structured format
    const structuredData = parseReceiptText(result.text, result.confidence);
    
    return {
      ...structuredData,
      ocrConfidence: result.confidence,
      ocrProvider: provider,
      rawText: result.text
    };
  } catch (error) {
    throw new Error(`OCR processing failed: ${error.message}`);
  }
}

/**
 * Parse OCR text into structured receipt format
 * This is a simplified parser - in production, use AI/ML for better accuracy
 */
function parseReceiptText(text, confidence) {
  // Basic parsing logic - extract common patterns
  const lines = text.split('\n').filter(line => line.trim());
  
  let vendor = '';
  let date = '';
  let total = 0;
  let tax = 0;
  let currency = 'USD';
  let vatId = '';
  let invoiceNumber = '';
  const lineItems = [];
  
  // Extract vendor (usually first line or contains "Inc", "LLC", etc.)
  for (const line of lines) {
    if (line.match(/(Inc|LLC|Ltd|Corp|Company)/i)) {
      vendor = line.trim();
      break;
    }
  }
  if (!vendor && lines.length > 0) {
    vendor = lines[0].trim();
  }
  
  // Extract date (look for date patterns)
  const datePatterns = [
    /\d{1,2}\/\d{1,2}\/\d{4}/,
    /\d{4}-\d{2}-\d{2}/,
    /\d{1,2}-\d{1,2}-\d{4}/
  ];
  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        date = normalizeDate(match[0]);
        break;
      }
    }
    if (date) break;
  }
  
  // Extract total (look for "Total", "Amount", "$", "€")
  const totalPatterns = [
    /total[:\s]+[\$€]?([\d,]+\.?\d*)/i,
    /amount[:\s]+[\$€]?([\d,]+\.?\d*)/i,
    /[\$€]([\d,]+\.?\d*)\s*$/,
    /^[\$€]([\d,]+\.?\d*)$/
  ];
  for (const line of lines) {
    for (const pattern of totalPatterns) {
      const match = line.match(pattern);
      if (match) {
        total = parseFloat(match[1].replace(/,/g, ''));
        if (line.includes('€')) currency = 'EUR';
        break;
      }
    }
    if (total) break;
  }
  
  // Extract tax
  const taxPatterns = [
    /tax[:\s]+[\$€]?([\d,]+\.?\d*)/i,
    /vat[:\s]+[\$€]?([\d,]+\.?\d*)/i
  ];
  for (const line of lines) {
    for (const pattern of taxPatterns) {
      const match = line.match(pattern);
      if (match) {
        tax = parseFloat(match[1].replace(/,/g, ''));
        break;
      }
    }
    if (tax) break;
  }
  
  // Extract VAT ID (EU format)
  const vatPattern = /(?:VAT|VAT ID|VAT-ID)[:\s]*([A-Z]{2}[\dA-Z]+)/i;
  for (const line of lines) {
    const match = line.match(vatPattern);
    if (match) {
      vatId = match[1].trim();
      break;
    }
  }
  
  // Extract invoice number
  const invoicePatterns = [
    /invoice[#:\s]+([A-Z0-9-]+)/i,
    /inv[#:\s]+([A-Z0-9-]+)/i,
    /#([A-Z0-9-]+)/
  ];
  for (const line of lines) {
    for (const pattern of invoicePatterns) {
      const match = line.match(pattern);
      if (match) {
        invoiceNumber = match[1].trim();
        break;
      }
    }
    if (invoiceNumber) break;
  }
  
  return {
    vendor: vendor || 'Unknown Vendor',
    date: date || new Date().toISOString().split('T')[0],
    total: total || 0,
    tax: tax || 0,
    currency: currency,
    VAT_ID: vatId || undefined,
    invoice_number: invoiceNumber || undefined,
    line_items: lineItems
  };
}

/**
 * Normalize date to YYYY-MM-DD format
 */
function normalizeDate(dateString) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

module.exports = {
  processReceipt,
  parseReceiptText
};

