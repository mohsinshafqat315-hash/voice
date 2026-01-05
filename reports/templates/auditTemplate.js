// Audit report template - formats audit data for export
// Defines audit report structure, risk summaries, compliance issues

const PDFDocument = require('pdfkit');

/**
 * Generate audit report from receipts and audit logs
 * @param {Array} receipts - Array of receipt objects with risk analysis
 * @param {Array} auditLogs - Array of audit log entries
 * @param {Object} options - Report options
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generateAuditReport(receipts, auditLogs = [], options = {}) {
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
      
      const userId = options.userId || 'Unknown';
      const dateFrom = options.dateFrom || '';
      const dateTo = options.dateTo || '';
      
      // Title Page
      doc.fontSize(24).text('AUDIT REPORT', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).text('LedgerSmart AI Compliance & Risk Assessment', { align: 'center' });
      doc.moveDown(2);
      
      doc.fontSize(12);
      doc.text(`Report Period: ${dateFrom ? formatDate(dateFrom) : 'All Time'} to ${dateFrom ? formatDate(dateTo) : 'Present'}`);
      doc.text(`Generated: ${new Date().toLocaleString()}`);
      doc.text(`User ID: ${userId}`);
      doc.moveDown(2);
      
      // Executive Summary
      doc.addPage();
      doc.fontSize(18).text('Executive Summary', { underline: true });
      doc.moveDown();
      
      const summary = calculateAuditSummary(receipts, auditLogs);
      
      doc.fontSize(12);
      doc.text(`Total Receipts Reviewed: ${summary.totalReceipts}`);
      doc.text(`Total Amount: ${formatCurrency(summary.totalAmount, summary.currency)}`);
      doc.moveDown();
      
      doc.fontSize(14).text('Risk Distribution', { underline: true });
      doc.fontSize(12);
      doc.text(`High Risk: ${summary.riskCounts.High} (${summary.riskPercentages.High}%)`);
      doc.fillColor('red');
      doc.text(`Medium Risk: ${summary.riskCounts.Medium} (${summary.riskPercentages.Medium}%)`);
      doc.fillColor('orange');
      doc.text(`Low Risk: ${summary.riskCounts.Low} (${summary.riskPercentages.Low}%)`);
      doc.fillColor('black');
      doc.moveDown();
      
      doc.fontSize(14).text('Compliance Status', { underline: true });
      doc.fontSize(12);
      doc.text(`Compliant Receipts: ${summary.compliantCount} (${summary.compliantPercentage}%)`);
      doc.text(`Requires Review: ${summary.requiresReviewCount}`);
      doc.text(`Flagged Receipts: ${summary.flaggedCount}`);
      doc.moveDown();
      
      // Risk Analysis Section
      doc.addPage();
      doc.fontSize(18).text('Risk Analysis', { underline: true });
      doc.moveDown();
      
      const highRiskReceipts = receipts.filter(r => r.aiAnalysis?.risk_level === 'High');
      const mediumRiskReceipts = receipts.filter(r => r.aiAnalysis?.risk_level === 'Medium');
      
      if (highRiskReceipts.length > 0) {
        doc.fontSize(14).fillColor('red').text('High Risk Receipts', { underline: true });
        doc.fillColor('black');
        doc.moveDown(0.5);
        
        highRiskReceipts.forEach((receipt, index) => {
          if (doc.y > doc.page.height - 150) {
            doc.addPage();
          }
          
          doc.fontSize(11).text(`Receipt ${index + 1}:`, { bold: true });
          doc.fontSize(10);
          doc.text(`  Date: ${formatDate(receipt.date)}`);
          doc.text(`  Vendor: ${receipt.vendor || 'N/A'}`);
          doc.text(`  Amount: ${formatCurrency(receipt.total || 0, receipt.currency || 'USD')}`);
          doc.text(`  Risk Score: ${receipt.aiAnalysis?.risk_score || 0}/100`);
          
          if (receipt.aiAnalysis?.alerts && receipt.aiAnalysis.alerts.length > 0) {
            doc.fillColor('red');
            doc.text(`  Alerts: ${receipt.aiAnalysis.alerts.join(', ')}`);
            doc.fillColor('black');
          }
          
          doc.moveDown(0.5);
          doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
          doc.moveDown(0.5);
        });
      }
      
      if (mediumRiskReceipts.length > 0) {
        doc.moveDown();
        doc.fontSize(14).fillColor('orange').text('Medium Risk Receipts', { underline: true });
        doc.fillColor('black');
        doc.moveDown(0.5);
        
        doc.fontSize(10);
        doc.text(`Total Medium Risk: ${mediumRiskReceipts.length} receipts`);
        doc.text(`Average Risk Score: ${(mediumRiskReceipts.reduce((sum, r) => sum + (r.aiAnalysis?.risk_score || 0), 0) / mediumRiskReceipts.length).toFixed(1)}`);
      }
      
      // Compliance Issues
      doc.addPage();
      doc.fontSize(18).text('Compliance Issues', { underline: true });
      doc.moveDown();
      
      const complianceIssues = extractComplianceIssues(receipts);
      
      if (complianceIssues.length === 0) {
        doc.fontSize(12).fillColor('green').text('No compliance issues detected.', { bold: true });
        doc.fillColor('black');
      } else {
        complianceIssues.forEach((issue, index) => {
          if (doc.y > doc.page.height - 100) {
            doc.addPage();
          }
          
          doc.fontSize(12).text(`Issue ${index + 1}: ${issue.type}`, { bold: true });
          doc.fontSize(10);
          doc.text(`  Receipt: ${issue.receiptId}`);
          doc.text(`  Date: ${formatDate(issue.date)}`);
          doc.text(`  Vendor: ${issue.vendor}`);
          doc.text(`  Description: ${issue.description}`);
          doc.moveDown(0.5);
        });
      }
      
      // Audit Trail
      if (auditLogs && auditLogs.length > 0) {
        doc.addPage();
        doc.fontSize(18).text('Audit Trail', { underline: true });
        doc.moveDown();
        
        doc.fontSize(10);
        auditLogs.slice(0, 50).forEach((log, index) => { // Limit to 50 entries
          if (doc.y > doc.page.height - 80) {
            doc.addPage();
          }
          
          doc.text(`${formatDate(log.createdAt)} - ${formatAction(log.action)}`);
          if (log.details) {
            doc.fontSize(9).fillColor('gray');
            doc.text(`  ${JSON.stringify(log.details)}`, { indent: 20 });
            doc.fillColor('black');
          }
          doc.moveDown(0.3);
        });
      }
      
      // Recommendations
      doc.addPage();
      doc.fontSize(18).text('Recommendations', { underline: true });
      doc.moveDown();
      
      const recommendations = generateRecommendations(summary, receipts);
      
      recommendations.forEach((rec, index) => {
        if (doc.y > doc.page.height - 80) {
          doc.addPage();
        }
        
        doc.fontSize(12).text(`${index + 1}. ${rec.title}`, { bold: true });
        doc.fontSize(10);
        doc.text(rec.description, { indent: 20 });
        doc.moveDown(0.5);
      });
      
      // Footer
      doc.fontSize(8)
        .text(
          `This audit report was generated by LedgerSmart AI on ${new Date().toLocaleString()}`,
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
 * Calculate audit summary statistics
 */
function calculateAuditSummary(receipts, auditLogs) {
  const totalReceipts = receipts.length;
  const totalAmount = receipts.reduce((sum, r) => sum + (r.total || 0), 0);
  const currency = receipts[0]?.currency || 'USD';
  
  const riskCounts = {
    Low: receipts.filter(r => r.aiAnalysis?.risk_level === 'Low').length,
    Medium: receipts.filter(r => r.aiAnalysis?.risk_level === 'Medium').length,
    High: receipts.filter(r => r.aiAnalysis?.risk_level === 'High').length
  };
  
  const riskPercentages = {
    Low: totalReceipts > 0 ? ((riskCounts.Low / totalReceipts) * 100).toFixed(1) : 0,
    Medium: totalReceipts > 0 ? ((riskCounts.Medium / totalReceipts) * 100).toFixed(1) : 0,
    High: totalReceipts > 0 ? ((riskCounts.High / totalReceipts) * 100).toFixed(1) : 0
  };
  
  const compliantCount = receipts.filter(r => 
    r.aiAnalysis?.compliance_status === 'Compliant' || 
    (r.aiAnalysis?.risk_level === 'Low' && !r.aiAnalysis?.requires_review)
  ).length;
  
  const compliantPercentage = totalReceipts > 0 ? ((compliantCount / totalReceipts) * 100).toFixed(1) : 0;
  const requiresReviewCount = receipts.filter(r => r.aiAnalysis?.requires_review).length;
  const flaggedCount = receipts.filter(r => r.status === 'flagged').length;
  
  return {
    totalReceipts,
    totalAmount,
    currency,
    riskCounts,
    riskPercentages,
    compliantCount,
    compliantPercentage,
    requiresReviewCount,
    flaggedCount
  };
}

/**
 * Extract compliance issues from receipts
 */
function extractComplianceIssues(receipts) {
  const issues = [];
  
  receipts.forEach(receipt => {
    // High risk receipts
    if (receipt.aiAnalysis?.risk_level === 'High') {
      issues.push({
        type: 'High Risk Receipt',
        receiptId: receipt._id || receipt.id,
        date: receipt.date,
        vendor: receipt.vendor,
        description: `Receipt has a high risk score of ${receipt.aiAnalysis.risk_score}. ${(receipt.aiAnalysis.alerts || []).join(' ')}`
      });
    }
    
    // Missing VAT ID for EU receipts
    if (receipt.currency === 'EUR' && !receipt.VAT_ID && receipt.total > 0) {
      issues.push({
        type: 'Missing VAT ID',
        receiptId: receipt._id || receipt.id,
        date: receipt.date,
        vendor: receipt.vendor,
        description: 'EU receipt missing VAT identification number'
      });
    }
    
    // Alerts
    if (receipt.aiAnalysis?.alerts && receipt.aiAnalysis.alerts.length > 0) {
      receipt.aiAnalysis.alerts.forEach(alert => {
        issues.push({
          type: 'Compliance Alert',
          receiptId: receipt._id || receipt.id,
          date: receipt.date,
          vendor: receipt.vendor,
          description: alert
        });
      });
    }
  });
  
  return issues;
}

/**
 * Generate recommendations based on audit findings
 */
function generateRecommendations(summary, receipts) {
  const recommendations = [];
  
  if (summary.riskPercentages.High > 10) {
    recommendations.push({
      title: 'Review High Risk Receipts',
      description: `${summary.riskCounts.High} receipts (${summary.riskPercentages.High}%) are flagged as high risk. Immediate review and verification is recommended.`
    });
  }
  
  if (summary.requiresReviewCount > 0) {
    recommendations.push({
      title: 'Complete Pending Reviews',
      description: `${summary.requiresReviewCount} receipts require manual review. Please review and approve or reject these receipts.`
    });
  }
  
  if (summary.compliantPercentage < 80) {
    recommendations.push({
      title: 'Improve Compliance Rate',
      description: `Current compliance rate is ${summary.compliantPercentage}%. Consider implementing stricter validation and review processes.`
    });
  }
  
  const missingVAT = receipts.filter(r => r.currency === 'EUR' && !r.VAT_ID).length;
  if (missingVAT > 0) {
    recommendations.push({
      title: 'Collect VAT IDs for EU Receipts',
      description: `${missingVAT} EU receipts are missing VAT identification numbers. Ensure all EU vendors provide valid VAT IDs.`
    });
  }
  
  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Maintain Current Standards',
      description: 'Your receipts show good compliance. Continue monitoring and maintaining current review processes.'
    });
  }
  
  return recommendations;
}

/**
 * Format action name for display
 */
function formatAction(action) {
  const actionMap = {
    'receipt_uploaded': 'Receipt Uploaded',
    'receipt_approved': 'Receipt Approved',
    'receipt_rejected': 'Receipt Rejected',
    'receipt_deleted': 'Receipt Deleted',
    'subscription_created': 'Subscription Created',
    'subscription_updated': 'Subscription Updated',
    'subscription_canceled': 'Subscription Canceled',
    'payment_processed': 'Payment Processed',
    'user_created': 'User Created',
    'user_updated': 'User Updated',
    'settings_changed': 'Settings Changed',
    'report_exported': 'Report Exported',
    'admin_action': 'Admin Action'
  };
  
  return actionMap[action] || action;
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

/**
 * Generate audit report as CSV
 * @param {Array} receipts - Array of receipt objects
 * @param {Array} auditLogs - Array of audit log entries
 * @returns {string} CSV formatted string
 */
function generateAuditCSV(receipts, auditLogs = []) {
  const lines = [];
  
  // Header
  lines.push('AUDIT REPORT');
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('');
  
  // Summary
  const summary = calculateAuditSummary(receipts, auditLogs);
  lines.push('SUMMARY');
  lines.push(`Total Receipts,${summary.totalReceipts}`);
  lines.push(`Total Amount,${summary.totalAmount.toFixed(2)}`);
  lines.push(`High Risk,${summary.riskCounts.High} (${summary.riskPercentages.High}%)`);
  lines.push(`Medium Risk,${summary.riskCounts.Medium} (${summary.riskPercentages.Medium}%)`);
  lines.push(`Low Risk,${summary.riskCounts.Low} (${summary.riskPercentages.Low}%)`);
  lines.push(`Compliant Receipts,${summary.compliantCount} (${summary.compliantPercentage}%)`);
  lines.push(`Requires Review,${summary.requiresReviewCount}`);
  lines.push('');
  
  // High Risk Receipts
  lines.push('HIGH RISK RECEIPTS');
  lines.push('Date,Vendor,Amount,Risk Score,Alerts');
  const highRisk = receipts.filter(r => r.aiAnalysis?.risk_level === 'High');
  highRisk.forEach(r => {
    lines.push([
      formatDate(r.date),
      escapeCSV(r.vendor || ''),
      (r.total || 0).toFixed(2),
      r.aiAnalysis?.risk_score || 0,
      escapeCSV((r.aiAnalysis?.alerts || []).join('; '))
    ].join(','));
  });
  lines.push('');
  
  // Compliance Issues
  lines.push('COMPLIANCE ISSUES');
  lines.push('Type,Receipt ID,Date,Vendor,Description');
  const issues = extractComplianceIssues(receipts);
  issues.forEach(issue => {
    lines.push([
      escapeCSV(issue.type),
      issue.receiptId,
      formatDate(issue.date),
      escapeCSV(issue.vendor),
      escapeCSV(issue.description)
    ].join(','));
  });
  
  return lines.join('\n');
}

/**
 * Escape CSV field
 */
function escapeCSV(field) {
  if (field === null || field === undefined) {
    return '';
  }
  
  const string = String(field);
  
  if (string.includes(',') || string.includes('"') || string.includes('\n')) {
    return `"${string.replace(/"/g, '""')}"`;
  }
  
  return string;
}

module.exports = {
  generateAuditReport,
  generateAuditCSV,
  calculateAuditSummary,
  extractComplianceIssues,
  generateRecommendations
};
