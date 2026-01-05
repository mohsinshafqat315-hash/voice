// Example usage of the AI receipt processing module
// Demonstrates how to use the analyzeReceipt function

const { analyzeReceipt, batchAnalyzeReceipts } = require('./index');

// Example 1: Process a single receipt
async function exampleSingleReceipt() {
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
  console.log(JSON.stringify(result, null, 2));
}

// Example 2: Process EU receipt with VAT
async function exampleEUReceipt() {
  const ocrData = {
    vendor: "IKEA Deutschland",
    date: "2024-01-20",
    total: 299.00,
    tax: 47.84,
    currency: "EUR",
    VAT_ID: "DE123456789",
    invoice_number: "IKEA-2024-12345",
    line_items: [
      { item: "Furniture", quantity: 1, unit_price: 251.16, tax: 47.84 }
    ]
  };
  
  const result = await analyzeReceipt(ocrData);
  console.log(JSON.stringify(result, null, 2));
}

// Example 3: Process receipt with issues (missing VAT_ID for EU)
async function exampleProblematicReceipt() {
  const ocrData = {
    vendor: "French Restaurant",
    date: "2024-01-25",
    total: 85.00,
    tax: 14.17,
    currency: "EUR",
    // Missing VAT_ID - will trigger alert
    invoice_number: "FR-2024-001",
    line_items: [
      { item: "Dinner", quantity: 1, unit_price: 70.83, tax: 14.17 }
    ]
  };
  
  const result = await analyzeReceipt(ocrData);
  console.log(JSON.stringify(result, null, 2));
}

// Example 4: Batch process multiple receipts
async function exampleBatchProcessing() {
  const receipts = [
    {
      vendor: "Starbucks",
      date: "2024-01-15",
      total: 12.50,
      tax: 1.00,
      currency: "USD",
      invoice_number: "SB-001",
      line_items: [
        { item: "Coffee", quantity: 2, unit_price: 5.75, tax: 1.00 }
      ]
    },
    {
      vendor: "Office Depot",
      date: "2024-01-16",
      total: 45.00,
      tax: 3.60,
      currency: "USD",
      invoice_number: "OD-002",
      line_items: [
        { item: "Printer Paper", quantity: 5, unit_price: 8.28, tax: 3.60 }
      ]
    }
  ];
  
  const results = await batchAnalyzeReceipts(receipts);
  console.log(JSON.stringify(results, null, 2));
}

// Example 5: Check for duplicates
async function exampleDuplicateDetection() {
  const existingReceipts = [
    {
      vendor: "Amazon",
      date: "2024-01-15",
      total: 125.50,
      invoice_number: "INV-2024-001"
    }
  ];
  
  const newReceipt = {
    vendor: "Amazon",
    date: "2024-01-15",
    total: 125.50,
    tax: 10.04,
    currency: "USD",
    invoice_number: "INV-2024-001", // Same invoice number
    line_items: []
  };
  
  const result = await analyzeReceipt(newReceipt, existingReceipts);
  console.log(JSON.stringify(result, null, 2));
}

// Run examples
if (require.main === module) {
  console.log("=== Example 1: Single US Receipt ===");
  exampleSingleReceipt().catch(console.error);
  
  console.log("\n=== Example 2: EU Receipt with VAT ===");
  exampleEUReceipt().catch(console.error);
  
  console.log("\n=== Example 3: Problematic Receipt (Missing VAT_ID) ===");
  exampleProblematicReceipt().catch(console.error);
  
  console.log("\n=== Example 4: Batch Processing ===");
  exampleBatchProcessing().catch(console.error);
  
  console.log("\n=== Example 5: Duplicate Detection ===");
  exampleDuplicateDetection().catch(console.error);
}

module.exports = {
  exampleSingleReceipt,
  exampleEUReceipt,
  exampleProblematicReceipt,
  exampleBatchProcessing,
  exampleDuplicateDetection
};

