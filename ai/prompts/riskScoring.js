// GPT prompts for risk scoring and fraud detection
// Prompts for calculating risk scores, identifying suspicious patterns, flagging anomalies

/**
 * Generate risk scoring prompt for AI
 * @param {Object} receiptData - Receipt data
 * @param {Object} context - Additional context (duplicates, history, etc.)
 * @returns {string} Formatted prompt for AI
 */
function generateRiskScoringPrompt(receiptData, context = {}) {
  const { duplicateCheck, taxDiscrepancy, dateAnomalies } = context;
  
  return `Analyze this receipt for risk factors and calculate a risk score (0-100). Return ONLY valid JSON.

Receipt Data:
- Vendor: ${receiptData.vendor || 'Unknown'}
- Date: ${receiptData.date || 'Unknown'}
- Total: ${receiptData.currency || 'USD'} ${receiptData.total || 0}
- Tax: ${receiptData.tax || 0}
- Invoice Number: ${receiptData.invoice_number || 'Missing'}
- VAT ID: ${receiptData.VAT_ID || 'Missing (required for EU)'}

Risk Factors:
${duplicateCheck?.isDuplicate ? '- ⚠️ Duplicate invoice detected' : ''}
${taxDiscrepancy?.hasDiscrepancy ? '- ⚠️ Tax amount discrepancy' : ''}
${dateAnomalies?.hasAnomaly ? '- ⚠️ Date anomaly: ' + dateAnomalies.type : ''}
${!receiptData.VAT_ID && receiptData.currency === 'EUR' ? '- ⚠️ Missing VAT ID for EU receipt' : ''}

Calculate risk score considering:
- Missing required fields (10-20 points each)
- Duplicate detection (30 points)
- Tax discrepancies (5-20 points)
- Date anomalies (10-15 points)
- Compliance issues (5-15 points)
- Other irregularities (5-15 points)

Return JSON format:
{
  "risk_score": 0-100,
  "risk_level": "Low" | "Medium" | "High",
  "risk_factors": ["array of identified risk factors"],
  "confidence": 0.0-1.0,
  "recommendations": ["array of recommendations"]
}`;
}

/**
 * Parse AI risk scoring response
 * @param {string} aiResponse - Raw AI response
 * @returns {Object} Parsed risk score result
 */
function parseRiskScoringResponse(aiResponse) {
  try {
    let jsonStr = aiResponse.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    const parsed = JSON.parse(jsonStr);
    
    // Validate risk score
    const riskScore = Math.max(0, Math.min(100, parseFloat(parsed.risk_score) || 0));
    
    // Determine risk level
    let riskLevel = 'Low';
    if (riskScore > 60) riskLevel = 'High';
    else if (riskScore > 30) riskLevel = 'Medium';
    
    return {
      risk_score: riskScore,
      risk_level: parsed.risk_level || riskLevel,
      risk_factors: Array.isArray(parsed.risk_factors) ? parsed.risk_factors : [],
      confidence: Math.max(0, Math.min(1, parsed.confidence || 0.7)),
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
    };
  } catch (error) {
    // Fallback risk scoring
    return {
      risk_score: 50,
      risk_level: 'Medium',
      risk_factors: ['Failed to parse AI response'],
      confidence: 0.3,
      recommendations: ['Manual review recommended']
    };
  }
}

/**
 * Calculate risk score using AI (mock - replace with actual AI call)
 * @param {Object} receiptData - Receipt data
 * @param {Object} context - Context information
 * @returns {Promise<Object>} Risk score result
 */
async function calculateRiskScore(receiptData, context = {}) {
  // This is already implemented in ai/utils/riskScoring.js
  // This function would call AI API in production
  const { calculateRiskScore: calcRisk } = require('../utils/riskScoring');
  
  const riskScore = calcRisk({
    validationResult: context.validationResult || { missing: [], issues: [] },
    duplicateCheck: context.duplicateCheck || { isDuplicate: false },
    taxDiscrepancy: context.taxDiscrepancy || { hasDiscrepancy: false },
    dateAnomalies: context.dateAnomalies || { hasAnomaly: false },
    ocrData: receiptData
  });
  
  let riskLevel = 'Low';
  if (riskScore > 60) riskLevel = 'High';
  else if (riskScore > 30) riskLevel = 'Medium';
  
  const riskFactors = [];
  if (context.duplicateCheck?.isDuplicate) riskFactors.push('Duplicate invoice detected');
  if (context.taxDiscrepancy?.hasDiscrepancy) riskFactors.push('Tax amount discrepancy');
  if (context.dateAnomalies?.hasAnomaly) riskFactors.push(`Date anomaly: ${context.dateAnomalies.type}`);
  if (!receiptData.VAT_ID && receiptData.currency === 'EUR') riskFactors.push('Missing VAT ID for EU receipt');
  
  return {
    risk_score: riskScore,
    risk_level: riskLevel,
    risk_factors: riskFactors,
    confidence: 0.8,
    recommendations: riskFactors.length > 0 ? ['Review receipt manually'] : []
  };
}

module.exports = {
  generateRiskScoringPrompt,
  parseRiskScoringResponse,
  calculateRiskScore
};
