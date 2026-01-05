// US receipt parser - extracts structured data from US receipts
// Parses common US receipt formats, extracts merchant, amount, date, items

/**
 * Parse US receipt text into structured data
 * @param {string} text - OCR extracted text
 * @returns {Object} Parsed receipt data
 */
function parseUSReceipt(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let vendor = 'Unknown Vendor';
  let date = new Date().toISOString().split('T')[0];
  let total = 0;
  let tax = 0;
  let invoiceNumber = null;
  const lineItems = [];
  
  // Extract vendor (usually first non-empty line or contains business indicators)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (line.match(/(Inc|LLC|Ltd|Corp|Company|Store|Shop)/i) || 
        (line.length > 3 && line.length < 50 && !line.match(/\d/))) {
      vendor = line;
      break;
    }
  }
  if (vendor === 'Unknown Vendor' && lines.length > 0) {
    vendor = lines[0];
  }
  
  // Extract date (multiple formats)
  const datePatterns = [
    /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/,  // MM/DD/YYYY
    /\b(\d{4})-(\d{2})-(\d{2})\b/,        // YYYY-MM-DD
    /\b(\d{1,2})-(\d{1,2})-(\d{4})\b/     // MM-DD-YYYY
  ];
  
  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        let dateStr;
        if (match[0].includes('/')) {
          const [month, day, year] = match[0].split('/');
          dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else if (match[0].includes('-')) {
          dateStr = match[0];
        }
        if (dateStr) {
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) {
            date = d.toISOString().split('T')[0];
            break;
          }
        }
      }
    }
    if (date !== new Date().toISOString().split('T')[0]) break;
  }
  
  // Extract total (look for "Total", "Amount Due", "$" patterns)
  const totalPatterns = [
    /total[:\s]+[\$]?([\d,]+\.?\d*)/i,
    /amount[:\s]+[\$]?([\d,]+\.?\d*)/i,
    /due[:\s]+[\$]?([\d,]+\.?\d*)/i,
    /^[\$]([\d,]+\.?\d*)$/,
    /\b[\$]([\d,]+\.?\d*)\s*$/m
  ];
  
  for (const line of lines) {
    for (const pattern of totalPatterns) {
      const match = line.match(pattern);
      if (match) {
        total = parseFloat(match[1].replace(/,/g, ''));
        if (total > 0) break;
      }
    }
    if (total > 0) break;
  }
  
  // Extract tax
  const taxPatterns = [
    /tax[:\s]+[\$]?([\d,]+\.?\d*)/i,
    /sales\s+tax[:\s]+[\$]?([\d,]+\.?\d*)/i,
    /subtotal[:\s]+[\$]?([\d,]+\.?\d*).*tax[:\s]+[\$]?([\d,]+\.?\d*)/i
  ];
  
  for (const line of lines) {
    for (const pattern of taxPatterns) {
      const match = line.match(pattern);
      if (match) {
        tax = parseFloat((match[2] || match[1]).replace(/,/g, ''));
        if (tax > 0) break;
      }
    }
    if (tax > 0) break;
  }
  
  // Extract invoice/receipt number
  const invoicePatterns = [
    /invoice[#:\s]+([A-Z0-9\-]+)/i,
    /inv[#:\s]+([A-Z0-9\-]+)/i,
    /receipt[#:\s]+([A-Z0-9\-]+)/i,
    /#([A-Z0-9\-]{4,})/i
  ];
  
  for (const line of lines) {
    for (const pattern of invoicePatterns) {
      const match = line.match(pattern);
      if (match) {
        invoiceNumber = match[1];
        break;
      }
    }
    if (invoiceNumber) break;
  }
  
  // Extract line items (look for item patterns)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Pattern: item name followed by price
    const itemMatch = line.match(/^(.+?)\s+[\$]?([\d,]+\.?\d*)$/);
    if (itemMatch && !line.match(/(total|tax|subtotal|amount)/i)) {
      lineItems.push({
        item: itemMatch[1].trim(),
        quantity: 1,
        unit_price: parseFloat(itemMatch[2].replace(/,/g, '')),
        tax: 0
      });
    }
  }
  
  return {
    vendor,
    date,
    total,
    tax,
    currency: 'USD',
    invoice_number: invoiceNumber,
    line_items: lineItems
  };
}

module.exports = {
  parseUSReceipt
};
