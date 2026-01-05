// CSV export template - formats data for CSV export
// Defines CSV structure, column headers, data formatting for receipts/expenses

/**
 * Generate CSV from receipts array
 * @param {Array} receipts - Array of receipt objects
 * @returns {string} CSV formatted string
 */
function generateCSV(receipts) {
  if (!receipts || receipts.length === 0) {
    return 'No receipts to export';
  }
  
  // CSV Headers
  const headers = [
    'Date',
    'Vendor',
    'Invoice Number',
    'Total',
    'Tax',
    'Currency',
    'VAT ID',
    'Category',
    'Status',
    'Risk Score',
    'Risk Level',
    'Alerts',
    'Notes'
  ];
  
  // Create CSV rows
  const rows = receipts.map(receipt => {
    return [
      formatDate(receipt.date),
      escapeCSV(receipt.vendor || ''),
      escapeCSV(receipt.invoice_number || ''),
      receipt.total || 0,
      receipt.tax || 0,
      receipt.currency || 'USD',
      escapeCSV(receipt.VAT_ID || ''),
      escapeCSV(receipt.category || ''),
      receipt.status || 'pending',
      receipt.aiAnalysis?.risk_score || 0,
      receipt.aiAnalysis?.risk_level || 'Low',
      escapeCSV((receipt.aiAnalysis?.alerts || []).join('; ')),
      escapeCSV(receipt.notes || '')
    ];
  });
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
}

/**
 * Escape CSV field (handle commas, quotes, newlines)
 */
function escapeCSV(field) {
  if (field === null || field === undefined) {
    return '';
  }
  
  const string = String(field);
  
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (string.includes(',') || string.includes('"') || string.includes('\n')) {
    return `"${string.replace(/"/g, '""')}"`;
  }
  
  return string;
}

/**
 * Format date for CSV
 */
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

module.exports = {
  generateCSV
};
