// Excel export template - formats data for Excel export
// Defines Excel structure, sheets, formulas for financial reports

/**
 * Generate Excel file from receipts array
 * Uses Excel XML format (Excel 2003+ compatible) for simplicity
 * @param {Array} receipts - Array of receipt objects
 * @param {Object} options - Export options
 * @returns {string} Excel XML formatted string
 */
function generateExcel(receipts, options = {}) {
  if (!receipts || receipts.length === 0) {
    return generateEmptyExcel();
  }
  
  const worksheetName = options.sheetName || 'Receipts';
  const dateFrom = options.dateFrom || '';
  const dateTo = options.dateTo || '';
  
  // Calculate summary statistics
  const totalAmount = receipts.reduce((sum, r) => sum + (r.total || 0), 0);
  const totalTax = receipts.reduce((sum, r) => sum + (r.tax || 0), 0);
  const riskCounts = {
    Low: receipts.filter(r => r.aiAnalysis?.risk_level === 'Low').length,
    Medium: receipts.filter(r => r.aiAnalysis?.risk_level === 'Medium').length,
    High: receipts.filter(r => r.aiAnalysis?.risk_level === 'High').length
  };
  
  // Excel XML header
  let excel = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Size="11"/>
   <Interior ss:Color="#4472C4" ss:Pattern="Solid"/>
   <Font ss:Color="#FFFFFF"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
   </Borders>
  </Style>
  <Style ss:ID="Summary">
   <Font ss:Bold="1" ss:Size="10"/>
   <Interior ss:Color="#D9E1F2" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Number">
   <NumberFormat ss:Format="0.00"/>
  </Style>
  <Style ss:ID="Date">
   <NumberFormat ss:Format="mm/dd/yyyy"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${escapeXML(worksheetName)}">
  <Table>`;
  
  // Summary section
  excel += `
   <Row>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Receipt Report Summary</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Report Period</Data></Cell>
    <Cell><Data ss:Type="String">${dateFrom ? formatDate(dateFrom) : 'All Time'} to ${dateTo ? formatDate(dateTo) : 'Present'}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Generated</Data></Cell>
    <Cell><Data ss:Type="String">${new Date().toLocaleString()}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="Summary"><Data ss:Type="String">Total Receipts</Data></Cell>
    <Cell ss:StyleID="Summary"><Data ss:Type="Number">${receipts.length}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="Summary"><Data ss:Type="String">Total Amount</Data></Cell>
    <Cell ss:StyleID="Summary" ss:StyleID="Number"><Data ss:Type="Number">${totalAmount.toFixed(2)}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="Summary"><Data ss:Type="String">Total Tax</Data></Cell>
    <Cell ss:StyleID="Summary" ss:StyleID="Number"><Data ss:Type="Number">${totalTax.toFixed(2)}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="Summary"><Data ss:Type="String">Risk Distribution</Data></Cell>
    <Cell><Data ss:Type="String">Low: ${riskCounts.Low}, Medium: ${riskCounts.Medium}, High: ${riskCounts.High}</Data></Cell>
   </Row>
   <Row></Row>`;
  
  // Headers
  excel += `
   <Row>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Date</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Vendor</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Invoice Number</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Total</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Tax</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Currency</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">VAT ID</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Category</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Risk Score</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Risk Level</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Alerts</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Notes</Data></Cell>
   </Row>`;
  
  // Data rows
  receipts.forEach(receipt => {
    const date = receipt.date ? new Date(receipt.date) : null;
    const excelDate = date ? dateToExcelSerial(date) : '';
    
    excel += `
   <Row>
    <Cell ss:StyleID="Date"><Data ss:Type="${date ? 'Number' : 'String'}">${date ? excelDate : ''}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXML(receipt.vendor || '')}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXML(receipt.invoice_number || '')}</Data></Cell>
    <Cell ss:StyleID="Number"><Data ss:Type="Number">${(receipt.total || 0).toFixed(2)}</Data></Cell>
    <Cell ss:StyleID="Number"><Data ss:Type="Number">${(receipt.tax || 0).toFixed(2)}</Data></Cell>
    <Cell><Data ss:Type="String">${receipt.currency || 'USD'}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXML(receipt.VAT_ID || '')}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXML(receipt.category || '')}</Data></Cell>
    <Cell><Data ss:Type="String">${receipt.status || 'pending'}</Data></Cell>
    <Cell><Data ss:Type="Number">${receipt.aiAnalysis?.risk_score || 0}</Data></Cell>
    <Cell><Data ss:Type="String">${receipt.aiAnalysis?.risk_level || 'Low'}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXML((receipt.aiAnalysis?.alerts || []).join('; '))}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXML(receipt.notes || '')}</Data></Cell>
   </Row>`;
  });
  
  excel += `
  </Table>
 </Worksheet>
</Workbook>`;
  
  return excel;
}

/**
 * Generate empty Excel file
 */
function generateEmptyExcel() {
  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Receipts">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">No receipts to export</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;
}

/**
 * Escape XML special characters
 */
function escapeXML(str) {
  if (str === null || str === undefined) {
    return '';
  }
  
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Convert JavaScript date to Excel serial date
 * Excel serial date is days since January 1, 1900
 */
function dateToExcelSerial(date) {
  const excelEpoch = new Date(1899, 11, 30);
  const diff = date - excelEpoch;
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Format date for display
 */
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString();
}

/**
 * Generate Excel buffer (for use with xlsx library if available)
 * Falls back to XML format if xlsx is not available
 * @param {Array} receipts - Array of receipt objects
 * @param {Object} options - Export options
 * @returns {Promise<Buffer>} Excel file buffer
 */
async function generateExcelBuffer(receipts, options = {}) {
  // Try to use xlsx library if available
  try {
    const XLSX = require('xlsx');
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Prepare data
    const data = receipts.map(receipt => ({
      'Date': receipt.date ? new Date(receipt.date).toLocaleDateString() : '',
      'Vendor': receipt.vendor || '',
      'Invoice Number': receipt.invoice_number || '',
      'Total': receipt.total || 0,
      'Tax': receipt.tax || 0,
      'Currency': receipt.currency || 'USD',
      'VAT ID': receipt.VAT_ID || '',
      'Category': receipt.category || '',
      'Status': receipt.status || 'pending',
      'Risk Score': receipt.aiAnalysis?.risk_score || 0,
      'Risk Level': receipt.aiAnalysis?.risk_level || 'Low',
      'Alerts': (receipt.aiAnalysis?.alerts || []).join('; '),
      'Notes': receipt.notes || ''
    }));
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, // Date
      { wch: 20 }, // Vendor
      { wch: 15 }, // Invoice Number
      { wch: 12 }, // Total
      { wch: 10 }, // Tax
      { wch: 8 },  // Currency
      { wch: 15 }, // VAT ID
      { wch: 15 }, // Category
      { wch: 10 }, // Status
      { wch: 12 }, // Risk Score
      { wch: 12 }, // Risk Level
      { wch: 30 }, // Alerts
      { wch: 30 }  // Notes
    ];
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, options.sheetName || 'Receipts');
    
    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  } catch (error) {
    // Fallback to XML format
    const xml = generateExcel(receipts, options);
    return Buffer.from(xml, 'utf8');
  }
}

module.exports = {
  generateExcel,
  generateExcelBuffer,
  generateEmptyExcel
};
