// Tests for AI receipt processing module
// Validates risk scoring, compliance checks, and suggestions

const { analyzeReceipt } = require('../../ai');

describe('AI Receipt Processing', () => {
  test('should process valid US receipt with low risk', async () => {
    const ocrData = {
      vendor: "Amazon",
      date: "2024-01-15",
      total: 125.50,
      tax: 10.04,
      currency: "USD",
      invoice_number: "INV-2024-001",
      line_items: [
        { item: "Office Supplies", quantity: 2, unit_price: 50.00, tax: 8.00 },
        { item: "Shipping", quantity: 1, unit_price: 25.50, tax: 2.04 }
      ]
    };
    
    const result = await analyzeReceipt(ocrData);
    
    expect(result).toHaveProperty('risk_score');
    expect(result).toHaveProperty('risk_level');
    expect(result).toHaveProperty('alerts');
    expect(result).toHaveProperty('suggested_corrections');
    expect(result).toHaveProperty('confidence_score');
    expect(result.risk_score).toBeGreaterThanOrEqual(0);
    expect(result.risk_score).toBeLessThanOrEqual(100);
    expect(['Low', 'Medium', 'High']).toContain(result.risk_level);
  });
  
  test('should flag missing VAT_ID for EU receipt', async () => {
    const ocrData = {
      vendor: "French Restaurant",
      date: "2024-01-25",
      total: 85.00,
      tax: 14.17,
      currency: "EUR",
      // Missing VAT_ID
      invoice_number: "FR-2024-001",
      line_items: []
    };
    
    const result = await analyzeReceipt(ocrData);
    
    expect(result.alerts).toContain('Add VAT ID for EU compliance.');
    expect(result.risk_score).toBeGreaterThan(30); // Should have higher risk
    expect(result.compliance_status).toBe('non-compliant');
  });
  
  test('should detect duplicate invoices', async () => {
    const existingReceipts = [
      {
        vendor: "Amazon",
        date: "2024-01-15",
        total: 125.50,
        invoice_number: "INV-2024-001"
      }
    ];
    
    const ocrData = {
      vendor: "Amazon",
      date: "2024-01-15",
      total: 125.50,
      tax: 10.04,
      currency: "USD",
      invoice_number: "INV-2024-001", // Duplicate
      line_items: []
    };
    
    const result = await analyzeReceipt(ocrData, existingReceipts);
    
    expect(result.alerts).toContain('Possible duplicate invoice detected.');
    expect(result.risk_score).toBeGreaterThanOrEqual(30);
  });
  
  test('should detect tax discrepancies', async () => {
    const ocrData = {
      vendor: "Store",
      date: "2024-01-15",
      total: 100.00, // OCR says 100
      tax: 10.00,
      currency: "USD",
      invoice_number: "INV-001",
      line_items: [
        { item: "Item 1", quantity: 1, unit_price: 50.00, tax: 5.00 },
        { item: "Item 2", quantity: 1, unit_price: 30.00, tax: 3.00 }
        // Sum = 88, but OCR says 100 - discrepancy!
      ]
    };
    
    const result = await analyzeReceipt(ocrData);
    
    expect(result.alerts.some(alert => alert.includes('Check total vs line items'))).toBe(true);
    expect(result.risk_score).toBeGreaterThan(20);
  });
  
  test('should flag future dates', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const dateString = futureDate.toISOString().split('T')[0];
    
    const ocrData = {
      vendor: "Store",
      date: dateString, // Future date
      total: 50.00,
      tax: 5.00,
      currency: "USD",
      invoice_number: "INV-001",
      line_items: []
    };
    
    const result = await analyzeReceipt(ocrData);
    
    expect(result.alerts).toContain('Invoice date is in the future, please verify.');
    expect(result.risk_score).toBeGreaterThan(10);
  });
  
  test('should validate EU VAT ID format', async () => {
    const ocrData = {
      vendor: "German Company",
      date: "2024-01-15",
      total: 100.00,
      tax: 19.00,
      currency: "EUR",
      VAT_ID: "DE123456789", // Valid German VAT ID
      invoice_number: "INV-001",
      line_items: []
    };
    
    const result = await analyzeReceipt(ocrData);
    
    expect(result.compliance_status).toBe('compliant');
    expect(result.alerts.filter(a => a.includes('VAT ID')).length).toBe(0);
  });
});

