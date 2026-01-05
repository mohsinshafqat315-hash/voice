// Report routes - handles report generation endpoints
// GET /reports, POST /reports/generate, GET /reports/:id

const express = require('express');
const router = express.Router();
const { exportReport, getReportSummary, exportAuditReport } = require('../controllers/reportsController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get report summary
router.get('/summary', getReportSummary);

// Export report
router.get('/export', exportReport);

// Export audit report
router.get('/audit', exportAuditReport);

module.exports = router;
