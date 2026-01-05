// PDF export template - formats data for PDF export
// Defines PDF layout, styling, sections for expense reports and summaries

const PDFDocument = require('pdfkit');

/**
 * Generate PDF from receipts array
 * @param {Array} receipts - Array of receipt objects
 * @param {Object} options - PDF generation options
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generatePDF(receipts, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
      
      // Header
      doc.fontSize(20).text('Receipt Report', { align: 'center' });
      doc.moveDown();
      
      if (options.dateFrom || options.dateTo) {
        doc.fontSize(12).text(
          `Period: ${options.dateFrom || 'Start'} to ${options.dateTo || 'End'}`,
          { align: 'center' }
        );
        doc.moveDown();
      }
      
      // Summary
      const totalAmount = receipts.reduce((sum, r) => sum + (r.total || 0), 0);
      const totalTax = receipts.reduce((sum, r) => sum + (r.tax || 0), 0);
      const riskCounts = {
        Low: receipts.filter(r => r.aiAnalysis?.risk_level === 'Low').length,
        Medium: receipts.filter(r => r.aiAnalysis?.risk_level === 'Medium').length,
        High: receipts.filter(r => r.aiAnalysis?.risk_level === 'High').length
      };
      
      doc.fontSize(14).text('Summary', { underline: true });
      doc.fontSize(10);
      doc.text(`Total Receipts: ${receipts.length}`);
      doc.text(`Total Amount: ${formatCurrency(totalAmount, receipts[0]?.currency || 'USD')}`);
      doc.text(`Total Tax: ${formatCurrency(totalTax, receipts[0]?.currency || 'USD')}`);
      doc.text(`Risk Distribution: Low (${riskCounts.Low}), Medium (${riskCounts.Medium}), High (${riskCounts.High})`);
      doc.moveDown(2);
      
      // Receipts table
      doc.fontSize(14).text('Receipt Details', { underline: true });
      doc.moveDown();
      
      let yPosition = doc.y;
      const tableTop = yPosition;
      const itemHeight = 60;
      let currentY = tableTop;
      
      receipts.forEach((receipt, index) => {
        // Check if we need a new page
        if (currentY + itemHeight > doc.page.height - 50) {
          doc.addPage();
          currentY = 50;
        }
        
        // Receipt entry
        doc.fontSize(10);
        doc.text(`Receipt ${index + 1}:`, 50, currentY, { bold: true });
        currentY += 15;
        
        doc.text(`Date: ${formatDate(receipt.date)}`, 60, currentY);
        currentY += 12;
        
        doc.text(`Vendor: ${receipt.vendor || 'N/A'}`, 60, currentY);
        currentY += 12;
        
        doc.text(`Amount: ${formatCurrency(receipt.total || 0, receipt.currency || 'USD')}`, 60, currentY);
        currentY += 12;
        
        if (receipt.aiAnalysis) {
          doc.text(`Risk: ${receipt.aiAnalysis.risk_level} (${receipt.aiAnalysis.risk_score})`, 60, currentY);
          currentY += 12;
        }
        
        if (receipt.aiAnalysis?.alerts && receipt.aiAnalysis.alerts.length > 0) {
          doc.fontSize(8).fillColor('red');
          doc.text(`Alerts: ${receipt.aiAnalysis.alerts.join(', ')}`, 60, currentY, {
            width: 500
          });
          doc.fillColor('black');
          currentY += 15;
        }
        
        currentY += 10;
        doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
        currentY += 5;
      });
      
      // Footer
      doc.fontSize(8)
        .text(
          `Generated on ${new Date().toLocaleString()}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Format currency
 */
function formatCurrency(amount, currency = 'USD') {
  const symbols = {
    USD: '$',
    EUR: '€',
    PKR: '₨'
  };
  
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Format date
 */
function formatDate(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString();
}

module.exports = {
  generatePDF
};
