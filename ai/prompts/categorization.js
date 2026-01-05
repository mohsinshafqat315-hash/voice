// GPT prompts for expense categorization
// Prompts for automatically categorizing expenses based on merchant, description, amount

/**
 * Generate categorization prompt for AI
 * @param {Object} receiptData - Receipt data with vendor, line items, etc.
 * @returns {string} Formatted prompt for AI
 */
function generateCategorizationPrompt(receiptData) {
  const { vendor, line_items = [], total, currency } = receiptData;
  
  const itemsList = line_items.map((item, idx) => 
    `${idx + 1}. ${item.item || 'Item'} - ${item.quantity || 1}x $${item.unit_price || 0}`
  ).join('\n');
  
  return `Analyze this receipt and categorize the expense. Return ONLY valid JSON.

Receipt Details:
- Vendor: ${vendor || 'Unknown'}
- Total: ${currency || 'USD'} ${total || 0}
- Items:
${itemsList || 'No items listed'}

Categories available:
- Office Supplies
- Travel
- Meals & Entertainment
- Software & Subscriptions
- Professional Services
- Utilities
- Marketing & Advertising
- Equipment
- Training & Education
- Insurance
- Rent
- Other

Return JSON format:
{
  "category": "string (one of the categories above)",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation",
  "subcategory": "string (optional, more specific)"
}`;
}

/**
 * Parse AI categorization response
 * @param {string} aiResponse - Raw AI response
 * @returns {Object} Parsed categorization result
 */
function parseCategorizationResponse(aiResponse) {
  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = aiResponse.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    const parsed = JSON.parse(jsonStr);
    
    // Validate category
    const validCategories = [
      'Office Supplies', 'Travel', 'Meals & Entertainment', 'Software & Subscriptions',
      'Professional Services', 'Utilities', 'Marketing & Advertising', 'Equipment',
      'Training & Education', 'Insurance', 'Rent', 'Other'
    ];
    
    if (!validCategories.includes(parsed.category)) {
      parsed.category = 'Other';
      parsed.confidence = Math.max(0.3, parsed.confidence || 0.5);
    }
    
    return {
      category: parsed.category || 'Other',
      confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
      reasoning: parsed.reasoning || 'Auto-categorized',
      subcategory: parsed.subcategory || null
    };
  } catch (error) {
    // Fallback categorization based on vendor name
    return {
      category: 'Other',
      confidence: 0.3,
      reasoning: 'Failed to parse AI response, using fallback',
      subcategory: null
    };
  }
}

/**
 * Categorize receipt using AI (mock implementation - replace with actual AI call)
 * @param {Object} receiptData - Receipt data
 * @returns {Promise<Object>} Categorization result
 */
async function categorizeReceipt(receiptData) {
  // In production, this would call OpenAI/Anthropic API
  // For now, return rule-based categorization
  const vendor = (receiptData.vendor || '').toLowerCase();
  
  let category = 'Other';
  let confidence = 0.6;
  
  if (vendor.includes('office') || vendor.includes('supply') || vendor.includes('staples')) {
    category = 'Office Supplies';
    confidence = 0.9;
  } else if (vendor.includes('hotel') || vendor.includes('airline') || vendor.includes('uber') || vendor.includes('lyft')) {
    category = 'Travel';
    confidence = 0.85;
  } else if (vendor.includes('restaurant') || vendor.includes('cafe') || vendor.includes('food')) {
    category = 'Meals & Entertainment';
    confidence = 0.8;
  } else if (vendor.includes('software') || vendor.includes('saas') || vendor.includes('subscription')) {
    category = 'Software & Subscriptions';
    confidence = 0.85;
  } else if (vendor.includes('legal') || vendor.includes('accounting') || vendor.includes('consulting')) {
    category = 'Professional Services';
    confidence = 0.8;
  } else if (vendor.includes('electric') || vendor.includes('utility') || vendor.includes('water')) {
    category = 'Utilities';
    confidence = 0.9;
  } else if (vendor.includes('marketing') || vendor.includes('advertising') || vendor.includes('google ads')) {
    category = 'Marketing & Advertising';
    confidence = 0.85;
  }
  
  return {
    category,
    confidence,
    reasoning: `Categorized based on vendor name: ${receiptData.vendor}`,
    subcategory: null
  };
}

module.exports = {
  generateCategorizationPrompt,
  parseCategorizationResponse,
  categorizeReceipt
};
