// GPT prompts for tax compliance checking
// Prompts for validating tax rules, identifying compliance issues, suggesting corrections

/**
 * Generate tax compliance prompt for AI
 * @param {Object} receiptData - Receipt data
 * @param {string} countryCode - Country code (US, DE, FR, etc.)
 * @param {string} currency - Currency code
 * @returns {string} Formatted prompt for AI
 */
function generateTaxCompliancePrompt(receiptData, countryCode = 'US', currency = 'USD') {
  const { vendor, date, total, tax, VAT_ID, invoice_number, line_items = [] } = receiptData;
  
  const itemsList = line_items.map((item, idx) => 
    `${idx + 1}. ${item.item || 'Item'} - Qty: ${item.quantity || 1} @ $${item.unit_price || 0} (Tax: $${item.tax || 0})`
  ).join('\n');
  
  return `Analyze this receipt for tax compliance issues. Return ONLY valid JSON.

Receipt Details:
- Vendor: ${vendor || 'Unknown'}
- Date: ${date || 'Unknown'}
- Total: ${currency} ${total || 0}
- Tax: ${currency} ${tax || 0}
- Country: ${countryCode}
- Currency: ${currency}
${VAT_ID ? `- VAT ID: ${VAT_ID}` : '- VAT ID: Missing'}
${invoice_number ? `- Invoice Number: ${invoice_number}` : '- Invoice Number: Missing'}
- Line Items:
${itemsList || 'No line items'}

Compliance Requirements:
${currency === 'EUR' ? '- VAT ID is REQUIRED for EU receipts' : ''}
${currency === 'USD' ? '- State sales tax should be 0-15%' : ''}
${currency === 'EUR' ? '- VAT rate should be 0-27%' : ''}
- All required fields must be present
- Tax amount must match line item calculations
- Date must be valid and not in future

Return JSON format:
{
  "compliant": true/false,
  "issues": ["array of compliance issues"],
  "suggestions": [
    {
      "field": "string",
      "current_value": "any",
      "suggested_value": "any",
      "reason": "string"
    }
  ],
  "tax_rate": number (0-1),
  "expected_tax": number,
  "actual_tax": number,
  "discrepancy": number,
  "requires_review": true/false,
  "confidence": 0.0-1.0
}`;
}

/**
 * Parse AI tax compliance response
 * @param {string} aiResponse - Raw AI response
 * @returns {Object} Parsed compliance result
 */
function parseTaxComplianceResponse(aiResponse) {
  try {
    let jsonStr = aiResponse.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    const parsed = JSON.parse(jsonStr);
    
    return {
      compliant: parsed.compliant !== false,
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      tax_rate: Math.max(0, Math.min(1, parseFloat(parsed.tax_rate) || 0)),
      expected_tax: parseFloat(parsed.expected_tax) || 0,
      actual_tax: parseFloat(parsed.actual_tax) || 0,
      discrepancy: parseFloat(parsed.discrepancy) || 0,
      requires_review: parsed.requires_review === true,
      confidence: Math.max(0, Math.min(1, parsed.confidence || 0.7))
    };
  } catch (error) {
    // Fallback compliance check
    return {
      compliant: false,
      issues: ['Failed to parse AI compliance response'],
      suggestions: [],
      tax_rate: 0,
      expected_tax: 0,
      actual_tax: 0,
      discrepancy: 0,
      requires_review: true,
      confidence: 0.3
    };
  }
}

/**
 * Check tax compliance using AI (mock - replace with actual AI call)
 * @param {Object} receiptData - Receipt data
 * @param {string} countryCode - Country code
 * @returns {Promise<Object>} Compliance result
 */
async function checkTaxCompliance(receiptData, countryCode = 'US') {
  const currency = receiptData.currency || 'USD';
  
  // Import compliance validators
  const { validateUSTax } = require('../rules/us/taxRules');
  const { validateEUReceipt } = require('../rules/eu/vatRules');
  
  let complianceResult;
  
  if (currency === 'EUR') {
    complianceResult = await validateEUReceipt(receiptData);
  } else if (currency === 'USD') {
    complianceResult = validateUSTax(receiptData, countryCode);
  } else {
    complianceResult = {
      compliant: true,
      alerts: [],
      suggestions: [`Compliance rules not available for ${currency}`]
    };
  }
  
  // Calculate tax rate
  const total = receiptData.total || 0;
  const tax = receiptData.tax || 0;
  const subtotal = total - tax;
  const taxRate = subtotal > 0 ? tax / subtotal : 0;
  
  // Calculate expected tax from line items
  let expectedTax = 0;
  if (receiptData.line_items && receiptData.line_items.length > 0) {
    expectedTax = receiptData.line_items.reduce((sum, item) => sum + (item.tax || 0), 0);
  }
  
  const discrepancy = Math.abs(expectedTax - tax);
  
  return {
    compliant: complianceResult.compliant,
    issues: complianceResult.alerts || [],
    suggestions: complianceResult.suggestions || [],
    tax_rate: taxRate,
    expected_tax: expectedTax || tax,
    actual_tax: tax,
    discrepancy: discrepancy,
    requires_review: complianceResult.requiresReview || discrepancy > 0.01 || !complianceResult.compliant,
    confidence: 0.8
  };
}

/**
 * Batch check tax compliance for multiple receipts
 * @param {Array} receipts - Array of receipt data
 * @param {string} countryCode - Country code
 * @returns {Promise<Array>} Array of compliance results
 */
async function batchCheckTaxCompliance(receipts, countryCode = 'US') {
  const results = [];
  
  for (const receipt of receipts) {
    try {
      const compliance = await checkTaxCompliance(receipt, countryCode);
      results.push({
        receipt_index: receipts.indexOf(receipt),
        receipt_data: receipt,
        compliance
      });
    } catch (error) {
      results.push({
        receipt_index: receipts.indexOf(receipt),
        receipt_data: receipt,
        compliance: {
          compliant: false,
          issues: [`Error: ${error.message}`],
          suggestions: [],
          requires_review: true,
          confidence: 0
        }
      });
    }
  }
  
  return results;
}

module.exports = {
  generateTaxCompliancePrompt,
  parseTaxComplianceResponse,
  checkTaxCompliance,
  batchCheckTaxCompliance
};
