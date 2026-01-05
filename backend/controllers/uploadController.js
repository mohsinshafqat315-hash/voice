// Upload controller - business logic for file uploads
// File validation, storage, OCR triggering, processing queue

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { processReceipt: processOCR } = require('../../ocr');
const { analyzeReceipt } = require('../../ai');
const Receipt = require('../models/Receipt');
const User = require('../models/User');
const drive = require('../utils/drive');
const logger = require('../utils/logger');

/**
 * Validate uploaded file
 * @param {Object} file - Multer file object
 * @returns {Object} Validation result
 */
function validateFile(file) {
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
    return { valid: false, errors };
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    errors.push('Invalid file type. Only JPEG, PNG, WEBP, and PDF are allowed.');
  }
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    errors.push('File size exceeds 10MB limit');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Process uploaded file
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
async function processUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    const validation = validateFile(req.file);
    if (!validation.valid) {
      // Clean up file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        error: validation.errors.join(', ')
      });
    }
    
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    // Check subscription limits
    const receiptCount = await Receipt.countDocuments({ userId });
    const limit = user.getReceiptLimit();
    if (limit > 0 && receiptCount >= limit) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        success: false,
        error: `Receipt limit reached. Upgrade your plan for more receipts.`
      });
    }
    
    logger.info('Processing receipt upload', { userId, fileName: req.file.originalname });
    
    // Process OCR
    const ocrResult = await processOCR(req.file.path, {
      language: user.currency === 'EUR' ? 'eng+fra+deu' : 'eng'
    });
    
    // Get existing receipts for duplicate checking
    const existingReceipts = await Receipt.find({ userId })
      .select('vendor date total invoice_number');
    
    // Run AI analysis
    const analysis = await analyzeReceipt(ocrResult, existingReceipts);
    
    // Save receipt
    const receipt = new Receipt({
      vendor: ocrResult.vendor,
      date: ocrResult.date,
      total: ocrResult.total,
      tax: ocrResult.tax,
      currency: ocrResult.currency || user.currency,
      VAT_ID: ocrResult.VAT_ID,
      invoice_number: ocrResult.invoice_number,
      line_items: ocrResult.line_items,
      userId,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      ocrData: {
        rawText: ocrResult.rawText,
        confidence: ocrResult.ocrConfidence,
        processedAt: new Date()
      },
      aiAnalysis: {
        risk_score: analysis.risk_score,
        risk_level: analysis.risk_level,
        alerts: analysis.alerts,
        suggested_corrections: analysis.suggested_corrections,
        confidence_score: analysis.confidence_score,
        compliance_status: analysis.compliance_status,
        requires_review: analysis.requires_review
      },
      status: analysis.requires_review ? 'flagged' : 'pending'
    });
    
    await receipt.save();
    
    logger.info('Receipt processed successfully', {
      userId,
      receiptId: receipt._id,
      riskScore: analysis.risk_score
    });
    
    res.status(201).json({
      success: true,
      receipt,
      analysis: {
        risk_score: analysis.risk_score,
        risk_level: analysis.risk_level,
        alerts: analysis.alerts,
        suggested_corrections: analysis.suggested_corrections,
        confidence_score: analysis.confidence_score,
        compliance_status: analysis.compliance_status,
        requires_review: analysis.requires_review
      }
    });
  } catch (error) {
    logger.error('Upload processing error', { error: error.message, stack: error.stack });
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  validateFile,
  processUpload
};
