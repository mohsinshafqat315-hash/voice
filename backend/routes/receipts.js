// Receipt routes - handles all receipt-related endpoints
// GET /receipts, POST /receipts, PUT /receipts/:id, DELETE /receipts/:id

const express = require('express');
const router = express.Router();
const {
  uploadReceipt,
  processReceipt,
  batchProcessReceipts,
  getReceipts,
  getReceipt,
  updateReceipt,
  deleteReceipt,
  getReceiptsForReview,
  approveReceipt,
  rejectReceipt
} = require('../controllers/receiptsController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadLimiter, processingLimiter } = require('../middleware/rateLimiter');
const { checkReceiptLimit } = require('../middleware/subscription');
const { longOperationTimeout } = require('../middleware/timeout');

// All routes require authentication
router.use(authenticate);

// Upload receipt file (with OCR processing)
router.post('/upload', 
  uploadLimiter, 
  checkReceiptLimit,
  longOperationTimeout(60000), // 60 second timeout for upload + OCR + AI
  upload.single('receipt'), 
  uploadReceipt
);

// Process OCR data and create receipt with AI analysis
router.post('/process', 
  processingLimiter,
  longOperationTimeout(30000),
  processReceipt
);

// Batch process multiple receipts
router.post('/batch-process', 
  processingLimiter,
  longOperationTimeout(120000), // 2 minutes for batch
  batchProcessReceipts
);

// Get all receipts (with optional filters)
router.get('/', getReceipts);

// Get receipts requiring review
router.get('/review', getReceiptsForReview);

// Get single receipt
router.get('/:id', getReceipt);

// Update receipt
router.put('/:id', updateReceipt);

// Delete receipt
router.delete('/:id', deleteReceipt);

// Approve receipt
router.post('/:id/approve', approveReceipt);

// Reject receipt
router.post('/:id/reject', rejectReceipt);

module.exports = router;
