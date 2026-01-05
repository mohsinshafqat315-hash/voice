// Audit controller - business logic for audit operations
// Risk scoring, compliance checking, flag management

const AuditLog = require('../models/AuditLog');
const Receipt = require('../models/Receipt');
const { buildPagination, buildFilter, formatPaginatedResponse } = require('../utils/query');

/**
 * Get audit logs
 * GET /api/audit
 */
async function getAuditLogs(req, res) {
  try {
    const userId = req.user.id;
    const pagination = buildPagination(req.query);
    
    const filter = buildFilter(req.query, {
      base: { userId },
      exactMatch: ['action', 'entityType']
    });
    
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      AuditLog.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      ...formatPaginatedResponse(logs, total, pagination)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get high-risk receipts
 * GET /api/audit/risks
 */
async function getHighRiskReceipts(req, res) {
  try {
    const userId = req.user.id;
    const { minScore = 60 } = req.query;
    
    const receipts = await Receipt.find({
      userId,
      'aiAnalysis.risk_score': { $gte: parseInt(minScore) }
    })
      .sort({ 'aiAnalysis.risk_score': -1 })
      .limit(100);
    
    res.json({
      success: true,
      count: receipts.length,
      receipts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Flag receipt for review
 * POST /api/audit/flag/:id
 */
async function flagReceipt(req, res) {
  try {
    const receipt = await Receipt.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!receipt) {
      return res.status(404).json({
        success: false,
        error: 'Receipt not found'
      });
    }
    
    receipt.status = 'flagged';
    receipt.aiAnalysis.requires_review = true;
    await receipt.save();
    
    await AuditLog.create({
      userId: req.user.id,
      action: 'receipt_uploaded',
      entityType: 'receipt',
      entityId: receipt._id,
      details: { flagged: true },
      ipAddress: req.ip
    });
    
    res.json({
      success: true,
      receipt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get audit statistics
 * GET /api/audit/stats
 */
async function getAuditStats(req, res) {
  try {
    const userId = req.user.id;
    
    const [totalLogs, highRiskCount, flaggedCount] = await Promise.all([
      AuditLog.countDocuments({ userId }),
      Receipt.countDocuments({
        userId,
        'aiAnalysis.risk_score': { $gte: 60 }
      }),
      Receipt.countDocuments({
        userId,
        status: 'flagged'
      })
    ]);
    
    res.json({
      success: true,
      stats: {
        totalLogs,
        highRiskReceipts: highRiskCount,
        flaggedReceipts: flaggedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  getAuditLogs,
  getHighRiskReceipts,
  flagReceipt,
  getAuditStats
};
