// EU receipt parser - extracts structured data from EU receipts
// Parses EU receipt formats, handles VAT information, multi-currency support

/**
 * Parse EU receipt text into structured data
 * @param {string} text - OCR extracted text
 * @returns {Object} Parsed receipt data
 */
function parseEUReceipt(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let vendor = 'Unknown Vendor';
  let date = new Date().toISOString().split('T')[0];
  let total = 0;
  let tax = 0;
  let vatId = null;
  let invoiceNumber = null;
  const lineItems = [];
  
  // Extract vendor
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (line.match(/(GmbH|Ltd|S\.A\.|S\.L\.|BV|AB|Oy|AS)/i) || 
        (line.length > 3 && line.length < 50)) {
      vendor = line;
      break;
    }
  }
  if (vendor === 'Unknown Vendor' && lines.length > 0) {
    vendor = lines[0];
  }
  
  // Extract date (EU formats: DD/MM/YYYY, DD.MM.YYYY, YYYY-MM-DD)
  const datePatterns = [
    /\b(\d{1,2})[\/\.](\d{1,2})[\/\.](\d{4})\b/,  // DD/MM/YYYY or DD.MM.YYYY
    /\b(\d{4})-(\d{2})-(\d{2})\b/                 // YYYY-MM-DD
  ];
  
  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        let dateStr;
        if (match[0].includes('/') || match[0].includes('.')) {
          const parts = match[0].split(/[\/\.]/);
          if (parts.length === 3) {
            // Assume DD/MM/YYYY format
            const [day, month, year] = parts;
            dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
        } else {
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
  
  // Extract total (look for "Total", "Summe", "Total TTC", "€" patterns)
  const totalPatterns = [
    /total[:\s]+[\€]?([\d,]+\.?\d*)/i,
    /summe[:\s]+[\€]?([\d,]+\.?\d*)/i,
    /total\s+ttc[:\s]+[\€]?([\d,]+\.?\d*)/i,
    /^[\€]([\d,]+\.?\d*)$/,
    /\b[\€]([\d,]+\.?\d*)\s*$/m
  ];
  
  for (const line of lines) {
    for (const pattern of totalPatterns) {
      const match = line.match(pattern);
      if (match) {
        total = parseFloat(match[1].replace(/[,\s]/g, '').replace('.', '.'));
        if (total > 0) break;
      }
    }
    if (total > 0) break;
  }
  
  // Extract VAT (look for "VAT", "MwSt", "TVA", "IVA", "BTW")
  const vatPatterns = [
    /vat[:\s]+[\€]?([\d,]+\.?\d*)/i,
    /mwst[:\s]+[\€]?([\d,]+\.?\d*)/i,
    /tva[:\s]+[\€]?([\d,]+\.?\d*)/i,
    /iva[:\s]+[\€]?([\d,]+\.?\d*)/i,
    /btw[:\s]+[\€]?([\d,]+\.?\d*)/i
  ];
  
  for (const line of lines) {
    for (const pattern of vatPatterns) {
      const match = line.match(pattern);
      if (match) {
        tax = parseFloat(match[1].replace(/[,\s]/g, '').replace('.', '.'));
        if (tax > 0) break;
      }
    }
    if (tax > 0) break;
  }
  
  // Extract VAT ID (EU format: 2 letters + alphanumeric)
  const vatIdPatterns = [
    /vat[:\s]+([A-Z]{2}[\dA-Z]+)/i,
    /vat-id[:\s]+([A-Z]{2}[\dA-Z]+)/i,
    /vat\s+id[:\s]+([A-Z]{2}[\dA-Z]+)/i,
    /ust-id[:\s]+([A-Z]{2}[\dA-Z]+)/i,
    /\b([A-Z]{2}[\dA-Z]{8,})\b/
  ];
  
  for (const line of lines) {
    for (const pattern of vatIdPatterns) {
      const match = line.match(pattern);
      if (match) {
        const candidate = match[1].toUpperCase();
        if (candidate.match(/^[A-Z]{2}[\dA-Z]{2,12}$/)) {
          vatId = candidate;
          break;
        }
      }
    }
    if (vatId) break;
  }
  
  // Extract invoice number
  const invoicePatterns = [
    /invoice[#:\s]+([A-Z0-9\-]+)/i,
    /rechnung[#:\s]+([A-Z0-9\-]+)/i,
    /facture[#:\s]+([A-Z0-9\-]+)/i,
    /factura[#:\s]+([A-Z0-9\-]+)/i,
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
  
  // Extract line items
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const itemMatch = line.match(/^(.+?)\s+[\€]?([\d,]+\.?\d*)$/);
    if (itemMatch && !line.match(/(total|vat|mwst|tva|summe|ttc)/i)) {
      lineItems.push({
        item: itemMatch[1].trim(),
        quantity: 1,
        unit_price: parseFloat(itemMatch[2].replace(/[,\s]/g, '').replace('.', '.')),
        tax: 0
      });
    }
  }
  
  return {
    vendor,
    date,
    total,
    tax,
    currency: 'EUR',
    VAT_ID: vatId,
    invoice_number: invoiceNumber,
    line_items: lineItems
  };
}

module.exports = {
  parseEUReceipt
};
