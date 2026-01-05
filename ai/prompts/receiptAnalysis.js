// GPT prompts for receipt analysis and data extraction
// Prompts for extracting amount, date, merchant, items, tax information

/**
 * Generate receipt analysis prompt for AI
 * @param {string} ocrText - Raw OCR extracted text
 * @param {string} currency - Expected currency
 * @returns {string} Formatted prompt for AI
 */
function generateReceiptAnalysisPrompt(ocrText, currency = 'USD') {
  return `Analyze this OCR-extracted receipt text and extract structured data. Return ONLY valid JSON.

OCR Text:
${ocrText}

Extract the following information:
- vendor (merchant name)
- date (YYYY-MM-DD format)
- total (numeric amount)
- tax (numeric amount)
- currency (${currency})
- VAT_ID (if present, for EU receipts)
- invoice_number (if present)
- line_items (array of {item, quantity, unit_price, tax})

Return JSON format:
{
  "vendor": "string",
  "date": "YYYY-MM-DD",
  "total": number,
  "tax": number,
  "currency": "${currency}",
  "VAT_ID": "string or null",
  "invoice_number": "string or null",
  "line_items": [
    {
      "item": "string",
      "quantity": number,
      "unit_price": number,
      "tax": number
    }
  ],
  "confidence": 0.0-1.0
}`;
}

/**
 * Parse AI receipt analysis response
 * @param {string} aiResponse - Raw AI response
 * @returns {Object} Parsed receipt data
 */
function parseReceiptAnalysisResponse(aiResponse) {
  try {
    let jsonStr = aiResponse.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    const parsed = JSON.parse(jsonStr);
    
    // Validate and normalize
    return {
      vendor: parsed.vendor || 'Unknown Vendor',
      date: parsed.date || new Date().toISOString().split('T')[0],
      total: parseFloat(parsed.total) || 0,
      tax: parseFloat(parsed.tax) || 0,
      currency: parsed.currency || 'USD',
      VAT_ID: parsed.VAT_ID || null,
      invoice_number: parsed.invoice_number || null,
      line_items: Array.isArray(parsed.line_items) ? parsed.line_items.map(item => ({
        item: item.item || 'Item',
        quantity: parseFloat(item.quantity) || 1,
        unit_price: parseFloat(item.unit_price) || 0,
        tax: parseFloat(item.tax) || 0
      })) : [],
      confidence: Math.max(0, Math.min(1, parsed.confidence || 0.7))
    };
  } catch (error) {
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}

/**
 * Analyze receipt using AI (mock - replace with actual AI call)
 * @param {string} ocrText - OCR text
 * @param {string} currency - Currency code
 * @returns {Promise<Object>} Analyzed receipt data
 */
async function analyzeReceiptText(ocrText, currency = 'USD') {
  // In production, call OpenAI/Anthropic API
  // For now, use regex-based extraction
  const lines = ocrText.split('\n').filter(l => l.trim());
  
  let vendor = 'Unknown Vendor';
  let date = new Date().toISOString().split('T')[0];
  let total = 0;
  let tax = 0;
  let invoiceNumber = null;
  let vatId = null;
  const lineItems = [];
  
  // Extract vendor (usually first line)
  if (lines.length > 0) {
    vendor = lines[0].trim();
  }
  
  // Extract date
  const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/;
  for (const line of lines) {
    const match = line.match(datePattern);
    if (match) {
      const dateStr = match[1];
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        date = d.toISOString().split('T')[0];
        break;
      }
    }
  }
  
  // Extract total
  const totalPattern = /(?:total|amount|sum)[:\s]*[\$€]?([\d,]+\.?\d*)/i;
  for (const line of lines) {
    const match = line.match(totalPattern);
    if (match) {
      total = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }
  
  // Extract tax
  const taxPattern = /(?:tax|vat)[:\s]*[\$€]?([\d,]+\.?\d*)/i;
  for (const line of lines) {
    const match = line.match(taxPattern);
    if (match) {
      tax = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }
  
  // Extract invoice number
  const invPattern = /(?:invoice|inv)[#:\s]*([A-Z0-9\-]+)/i;
  for (const line of lines) {
    const match = line.match(invPattern);
    if (match) {
      invoiceNumber = match[1];
      break;
    }
  }
  
  // Extract VAT ID (EU format)
  const vatPattern = /(?:VAT|VAT-ID|VAT ID)[:\s]*([A-Z]{2}[\dA-Z]+)/i;
  for (const line of lines) {
    const match = line.match(vatPattern);
    if (match) {
      vatId = match[1];
      break;
    }
  }
  
  return {
    vendor,
    date,
    total,
    tax,
    currency,
    VAT_ID: vatId,
    invoice_number: invoiceNumber,
    line_items: lineItems,
    confidence: 0.7
  };
}

module.exports = {
  generateReceiptAnalysisPrompt,
  parseReceiptAnalysisResponse,
  analyzeReceiptText
};
