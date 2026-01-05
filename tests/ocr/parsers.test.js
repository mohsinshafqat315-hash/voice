// OCR parser tests - tests for receipt parsing accuracy
// Tests US and EU receipt parsing, edge cases, error handling

const { parseUSReceipt } = require('../../ocr/parsers/usReceiptParser');
const { parseEUReceipt } = require('../../ocr/parsers/euReceiptParser');

describe('OCR Parsers', () => {
  describe('US Receipt Parser', () => {
    test('should parse basic US receipt', () => {
      const text = `
        AMAZON
        Invoice #INV-12345
        01/15/2024
        Item 1    $50.00
        Item 2    $30.00
        Subtotal  $80.00
        Tax       $6.40
        Total     $86.40
      `;
      
      const result = parseUSReceipt(text);
      
      expect(result.vendor).toBe('AMAZON');
      expect(result.total).toBeGreaterThan(0);
      expect(result.currency).toBe('USD');
    });
    
    test('should extract invoice number', () => {
      const text = 'Invoice #INV-12345\nTotal $100.00';
      const result = parseUSReceipt(text);
      expect(result.invoice_number).toBe('INV-12345');
    });
    
    test('should handle missing fields gracefully', () => {
      const text = 'Some text';
      const result = parseUSReceipt(text);
      expect(result).toHaveProperty('vendor');
      expect(result).toHaveProperty('total');
    });
  });
  
  describe('EU Receipt Parser', () => {
    test('should parse basic EU receipt', () => {
      const text = `
        IKEA Deutschland
        VAT ID: DE123456789
        Invoice #IKEA-123
        15.01.2024
        Item 1    €50.00
        VAT       €9.50
        Total     €59.50
      `;
      
      const result = parseEUReceipt(text);
      
      expect(result.vendor).toBeDefined();
      expect(result.currency).toBe('EUR');
      expect(result.VAT_ID).toBe('DE123456789');
    });
    
    test('should extract VAT ID', () => {
      const text = 'VAT ID: FR12345678901\nTotal €100.00';
      const result = parseEUReceipt(text);
      expect(result.VAT_ID).toBe('FR12345678901');
    });
  });
});

module.exports = {};
