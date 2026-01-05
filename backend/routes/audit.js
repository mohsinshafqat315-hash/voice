// Audit routes - handles audit mode endpoints
// GET /audit, GET /audit/risks, POST /audit/flag

const express = require('express');
const router = express.Router();
const {
  getAuditLogs,
  getHighRiskReceipts,
  flagReceipt,
  getAuditStats
} = require('../controllers/auditController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get audit logs
router.get('/', getAuditLogs);

// Get audit statistics
router.get('/stats', getAuditStats);

// Get high-risk receipts
router.get('/risks', getHighRiskReceipts);

// Flag receipt for review
router.post('/flag/:id', flagReceipt);

module.exports = router;
