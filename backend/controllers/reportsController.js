// Reports controller - business logic for report generation
// Aggregates data, formats reports, handles export logic

const Receipt = require('../models/Receipt');
const { generateCSV } = require('../../reports/templates/csvTemplate');
const { generatePDF } = require('../../reports/templates/pdfTemplate');
const { generateExcel, generateExcelBuffer } = require('../../reports/templates/excelTemplate');
const { generateAuditReport, generateAuditCSV } = require('../../reports/templates/auditTemplate');
const AuditLog = require('../models/AuditLog');

/**
 * Generate CSV report
 * GET /api/reports/export?format=csv
 */
async function exportReport(req, res) {
  try {
    const { format = 'csv', dateFrom, dateTo, riskLevel, status } = req.query;
    const userId = req.user.id;
    
    // Build query
    const query = { userId };
    
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }
    
    if (riskLevel) {
      query['aiAnalysis.risk_level'] = riskLevel;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Get receipts
    const receipts = await Receipt.find(query).sort({ date: -1 });
    
    if (receipts.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No receipts found for the selected criteria'
      });
    }
    
    // Generate report based on format
    if (format === 'csv') {
      const csv = generateCSV(receipts);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=receipts-${Date.now()}.csv`);
      res.send(csv);
    } else if (format === 'pdf') {
      const pdf = await generatePDF(receipts, {
        userId,
        dateFrom,
        dateTo
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=receipts-${Date.now()}.pdf`);
      res.send(pdf);
    } else if (format === 'excel' || format === 'xlsx') {
      try {
        // Try to generate Excel buffer (requires xlsx library)
        const excelBuffer = await generateExcelBuffer(receipts, {
          dateFrom,
          dateTo,
          sheetName: 'Receipts'
        });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=receipts-${Date.now()}.xlsx`);
        res.send(excelBuffer);
      } catch (error) {
        // Fallback to XML format
        const excel = generateExcel(receipts, {
          dateFrom,
          dateTo,
          sheetName: 'Receipts'
        });
        res.setHeader('Content-Type', 'application/vnd.ms-excel');
        res.setHeader('Content-Disposition', `attachment; filename=receipts-${Date.now()}.xls`);
        res.send(excel);
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid format. Use "csv", "pdf", or "excel"'
      });
    }
    
    // Log audit
    await AuditLog.create({
      userId,
      action: 'report_exported',
      entityType: 'report',
      details: { format, count: receipts.length }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get report summary/statistics
 * GET /api/reports/summary
 */
async function getReportSummary(req, res) {
  try {
    const { dateFrom, dateTo } = req.query;
    const userId = req.user.id;
    const cache = require('../utils/cache');
    
    // Create cache key
    const cacheKey = `summary:${userId}:${dateFrom || 'all'}:${dateTo || 'all'}`;
    
    // Check cache first (5 minute TTL)
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        summary: cached,
        cached: true
      });
    }
    
    const query = { userId };
    
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }
    
    // Use aggregation pipeline for better performance
    const [stats, riskStats, statusStats] = await Promise.all([
      // Total stats
      Receipt.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalReceipts: { $sum: 1 },
            totalAmount: { $sum: '$total' },
            totalTax: { $sum: '$tax' }
          }
        }
      ]),
      // Risk level counts
      Receipt.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$aiAnalysis.risk_level',
            count: { $sum: 1 }
          }
        }
      ]),
      // Status counts
      Receipt.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);
    
    // Format results
    const totalStats = stats[0] || { totalReceipts: 0, totalAmount: 0, totalTax: 0 };
    
    const riskCounts = {
      Low: 0,
      Medium: 0,
      High: 0
    };
    riskStats.forEach(stat => {
      if (stat._id) {
        riskCounts[stat._id] = stat.count;
      }
    });
    
    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      flagged: 0
    };
    statusStats.forEach(stat => {
      if (stat._id) {
        statusCounts[stat._id] = stat.count;
      }
    });
    
    // Monthly breakdown (only if not too many receipts)
    let monthlyData = {};
    if (totalStats.totalReceipts < 1000) {
      const monthlyStats = await Receipt.aggregate([
        { $match: query },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
            count: { $sum: 1 },
            total: { $sum: '$total' }
          }
        },
        { $sort: { _id: -1 } }
      ]);
      
      monthlyStats.forEach(stat => {
        monthlyData[stat._id] = {
          count: stat.count,
          total: stat.total
        };
      });
    }
    
    const summary = {
      totalReceipts: totalStats.totalReceipts,
      totalAmount: totalStats.totalAmount,
      totalTax: totalStats.totalTax,
      riskCounts,
      statusCounts,
      monthlyData
    };
    
    // Cache for 5 minutes
    cache.set(cacheKey, summary, 5 * 60 * 1000);
    
    res.json({
      success: true,
      summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Generate audit report
 * GET /api/reports/audit?format=pdf
 */
async function exportAuditReport(req, res) {
  try {
    const { format = 'pdf', dateFrom, dateTo } = req.query;
    const userId = req.user.id;
    
    // Build query
    const query = { userId };
    
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }
    
    // Get receipts and audit logs
    const [receipts, auditLogs] = await Promise.all([
      Receipt.find(query).sort({ date: -1 }),
      AuditLog.find({ userId }).sort({ createdAt: -1 }).limit(100)
    ]);
    
    if (receipts.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No receipts found for the selected criteria'
      });
    }
    
    // Generate audit report based on format
    if (format === 'pdf') {
      const pdf = await generateAuditReport(receipts, auditLogs, {
        userId,
        dateFrom,
        dateTo
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=audit-report-${Date.now()}.pdf`);
      res.send(pdf);
    } else if (format === 'csv') {
      const csv = generateAuditCSV(receipts, auditLogs);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=audit-report-${Date.now()}.csv`);
      res.send(csv);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid format. Use "pdf" or "csv"'
      });
    }
    
    // Log audit
    AuditLog.create({
      userId,
      action: 'report_exported',
      entityType: 'report',
      details: { format: `audit_${format}`, count: receipts.length }
    }).catch(err => {
      // Fire and forget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  exportReport,
  getReportSummary,
  exportAuditReport
};
