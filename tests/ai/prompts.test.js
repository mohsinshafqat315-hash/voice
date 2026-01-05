// AI prompt tests - tests for prompt generation and AI responses
// Validates prompt structure, response parsing, error handling

const { generateCategorizationPrompt, parseCategorizationResponse } = require('../../ai/prompts/categorization');
const { generateRiskScoringPrompt, parseRiskScoringResponse } = require('../../ai/prompts/riskScoring');

describe('AI Prompts', () => {
  describe('Categorization', () => {
    test('should generate valid prompt', () => {
      const receiptData = {
        vendor: 'Amazon',
        total: 100,
        currency: 'USD',
        line_items: []
      };
      
      const prompt = generateCategorizationPrompt(receiptData);
      expect(prompt).toContain('Amazon');
      expect(prompt).toContain('JSON');
    });
    
    test('should parse valid response', () => {
      const response = JSON.stringify({
        category: 'Office Supplies',
        confidence: 0.9,
        reasoning: 'Office supply purchase'
      });
      
      const parsed = parseCategorizationResponse(response);
      expect(parsed.category).toBe('Office Supplies');
      expect(parsed.confidence).toBeGreaterThanOrEqual(0);
      expect(parsed.confidence).toBeLessThanOrEqual(1);
    });
    
    test('should handle invalid response', () => {
      const response = 'Invalid JSON';
      const parsed = parseCategorizationResponse(response);
      expect(parsed.category).toBe('Other');
    });
  });
  
  describe('Risk Scoring', () => {
    test('should generate valid prompt', () => {
      const receiptData = {
        vendor: 'Test',
        date: '2024-01-15',
        total: 100,
        currency: 'USD'
      };
      
      const context = {
        duplicateCheck: { isDuplicate: false },
        taxDiscrepancy: { hasDiscrepancy: false }
      };
      
      const prompt = generateRiskScoringPrompt(receiptData, context);
      expect(prompt).toContain('risk score');
      expect(prompt).toContain('JSON');
    });
    
    test('should parse valid response', () => {
      const response = JSON.stringify({
        risk_score: 45,
        risk_level: 'Medium',
        risk_factors: ['Missing field'],
        confidence: 0.8
      });
      
      const parsed = parseRiskScoringResponse(response);
      expect(parsed.risk_score).toBeGreaterThanOrEqual(0);
      expect(parsed.risk_score).toBeLessThanOrEqual(100);
      expect(['Low', 'Medium', 'High']).toContain(parsed.risk_level);
    });
  });
});

module.exports = {};
