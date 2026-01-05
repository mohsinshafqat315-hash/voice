// Receipts controller - business logic for receipt operations
// Handles CRUD operations, validation, and data processing

const Receipt = require('../models/Receipt');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { analyzeReceipt, batchAnalyzeReceipts } = require('../../ai');
const { processReceipt: processOCR } = require('../../ocr');
const logger = require('../utils/logger');
const { getCache, setCache } = require('../utils/cache');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

/**
 * Upload and process receipt file
 * POST /api/receipts/upload
 */
async function uploadReceipt(req, res) {
  const logger = require('../utils/logger');
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    filePath = req.file.path;
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    // Check subscription limits (already checked by middleware, but double-check)
    const receiptCount = await Receipt.countDocuments({ userId });
    const limit = user.getReceiptLimit();
    if (limit > 0 && receiptCount >= limit) {
      // Delete uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(403).json({
        success: false,
        error: `You've reached your ${user.subscription.plan} plan limit of ${limit} receipts.`,
        limitReached: true,
        currentCount: receiptCount,
        limit,
        suggestedPlan: user.subscription.plan === 'free' ? 'Pro' : 'Business',
        upgradeUrl: '/settings/billing'
      });
    }
    
    logger.info('Processing receipt upload', { 
      userId, 
      fileName: req.file.originalname,
      fileSize: req.file.size 
    });
    
    // Process OCR with timeout and error handling
    let ocrResult;
    try {
      // Set timeout for OCR processing (30 seconds)
      const ocrPromise = processOCR(filePath, {
        language: user.settings?.currency === 'EUR' ? 'eng+fra+deu' : 'eng'
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('OCR processing timed out')), 30000);
      });
      
      ocrResult = await Promise.race([ocrPromise, timeoutPromise]);
    } catch (ocrError) {
      logger.error('OCR processing failed', { 
        error: ocrError.message, 
        userId,
        fileName: req.file.originalname 
      });
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      return res.status(500).json({
        success: false,
        error: 'We couldn\'t read your receipt. Please try uploading a clearer image.',
        code: 'OCR_FAILED'
      });
    }
    
    // Get existing receipts for duplicate checking (optimized query)
    const existingReceipts = await Receipt.find({ userId })
      .select('vendor date total invoice_number')
      .lean(); // Use lean for better performance
    
    // Run AI analysis with timeout and error handling
    let analysis;
    try {
      // Set timeout for AI analysis (20 seconds)
      const aiPromise = analyzeReceipt(ocrResult, existingReceipts);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('AI analysis timed out')), 20000);
      });
      
      analysis = await Promise.race([aiPromise, timeoutPromise]);
    } catch (aiError) {
      logger.error('AI analysis failed', { 
        error: aiError.message, 
        userId,
        fileName: req.file.originalname 
      });
      
      // Continue with basic analysis - don't fail the upload
      analysis = {
        risk_score: 50,
        risk_level: 'Medium',
        alerts: ['AI analysis unavailable. Manual review recommended.'],
        suggested_corrections: [],
        confidence_score: 0.5,
        compliance_status: 'Review Required',
        requires_review: true
      };
    }
    
    // Create receipt with analysis results
    const receipt = new Receipt({
      vendor: ocrResult.vendor,
      date: ocrResult.date,
      total: ocrResult.total,
      tax: ocrResult.tax,
      currency: ocrResult.currency || user.settings?.currency || 'USD',
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
    
    // Log audit (don't await - fire and forget for performance)
    AuditLog.create({
      userId,
      action: 'receipt_uploaded',
      entityType: 'receipt',
      entityId: receipt._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      riskScore: analysis.risk_score
    }).catch(err => {
      logger.error('Failed to create audit log', { error: err.message });
    });
    
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
    const logger = require('../utils/logger');
    logger.error('Receipt upload error', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user?.id 
    });
    
    // Clean up file on error
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkError) {
        logger.error('Failed to delete file on error', { error: unlinkError.message });
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'We encountered an issue processing your receipt. Please try again with a clearer image.',
      code: 'PROCESSING_FAILED'
    });
  }
}

/**
 * Process OCR data and create receipt with AI analysis
 * POST /api/receipts/process
 */
async function processReceipt(req, res) {
  try {
    const ocrData = req.body;
    const userId = req.user.id;
    
    // Get existing receipts for duplicate checking
    const existingReceipts = await Receipt.find({ userId }).select('vendor date total invoice_number');
    
    // Run AI analysis
    const analysis = await analyzeReceipt(ocrData, existingReceipts);
    
    // Create receipt with analysis results
    const receipt = new Receipt({
      ...ocrData,
      userId,
      riskScore: analysis.risk_score,
      riskLevel: analysis.risk_level,
      alerts: analysis.alerts,
      suggestedCorrections: analysis.suggested_corrections,
      confidenceScore: analysis.confidence_score,
      complianceStatus: analysis.compliance_status,
      requiresReview: analysis.requires_review,
      processedAt: new Date()
    });
    
    await receipt.save();
    
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
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Batch process multiple receipts
 * POST /api/receipts/batch-process
 */
async function batchProcessReceipts(req, res) {
  try {
    const { receipts } = req.body; // Array of OCR data
    const userId = req.user.id;
    
    // Get existing receipts for duplicate checking
    const existingReceipts = await Receipt.find({ userId }).select('vendor date total invoice_number');
    
    // Run batch AI analysis
    const analysisResults = await batchAnalyzeReceipts(receipts, existingReceipts);
    
    // Save all receipts
    const savedReceipts = [];
    for (const result of analysisResults) {
      const receipt = new Receipt({
        ...result.receipt_data,
        userId,
        riskScore: result.analysis.risk_score,
        riskLevel: result.analysis.risk_level,
        alerts: result.analysis.alerts,
        suggestedCorrections: result.analysis.suggested_corrections,
        confidenceScore: result.analysis.confidence_score,
        complianceStatus: result.analysis.compliance_status,
        requiresReview: result.analysis.requires_review,
        processedAt: new Date()
      });
      
      await receipt.save();
      savedReceipts.push(receipt);
    }
    
    res.status(201).json({
      success: true,
      count: savedReceipts.length,
      receipts: savedReceipts,
      analysis: analysisResults.map(r => ({
        receipt_index: r.receipt_index,
        risk_score: r.analysis.risk_score,
        risk_level: r.analysis.risk_level,
        requires_review: r.analysis.requires_review
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get all receipts for user
 * GET /api/receipts
 */
async function getReceipts(req, res) {
  try {
    const userId = req.user.id;
    const { 
      riskLevel, 
      requiresReview, 
      dateFrom, 
      dateTo, 
      status,
      page = 1, 
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;
    
    const query = { userId };
    
    if (riskLevel) query['aiAnalysis.risk_level'] = riskLevel;
    if (requiresReview !== undefined) query['aiAnalysis.requires_review'] = requiresReview === 'true';
    if (status) query.status = status;
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }
    
    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100); // Max 100 per page
    const skip = (pageNum - 1) * limitNum;
    
    // Sort
    const sort = {};
    const validSortFields = ['date', 'total', 'vendor', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'date';
    sort[sortField] = sortOrder === 'asc' ? 1 : -1;
    
    // Get total count and receipts
    const [total, receipts] = await Promise.all([
      Receipt.countDocuments(query),
      Receipt.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean() // Use lean for better performance
    ]);
    
    res.json({
      success: true,
      count: receipts.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
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
 * Get single receipt by ID
 * GET /api/receipts/:id
 */
async function getReceipt(req, res) {
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
 * Update receipt
 * PUT /api/receipts/:id
 */
async function updateReceipt(req, res) {
  try {
    const receipt = await Receipt.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!receipt) {
      return res.status(404).json({
        success: false,
        error: 'Receipt not found'
      });
    }
    
    // Re-run AI analysis if receipt data changed
    if (req.body.vendor || req.body.date || req.body.total || req.body.tax) {
      const existingReceipts = await Receipt.find({ 
        userId: req.user.id,
        _id: { $ne: receipt._id }
      }).select('vendor date total invoice_number');
      
      const analysis = await analyzeReceipt(receipt.toObject(), existingReceipts);
      
      receipt.riskScore = analysis.risk_score;
      receipt.riskLevel = analysis.risk_level;
      receipt.alerts = analysis.alerts;
      receipt.suggestedCorrections = analysis.suggested_corrections;
      receipt.confidenceScore = analysis.confidence_score;
      receipt.complianceStatus = analysis.compliance_status;
      receipt.requiresReview = analysis.requires_review;
      
      await receipt.save();
    }
    
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
 * Delete receipt
 * DELETE /api/receipts/:id
 */
async function deleteReceipt(req, res) {
  try {
    const receipt = await Receipt.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!receipt) {
      return res.status(404).json({
        success: false,
        error: 'Receipt not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Receipt deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get receipts requiring review
 * GET /api/receipts/review
 */
async function getReceiptsForReview(req, res) {
  try {
    const receipts = await Receipt.find({
      userId: req.user.id,
      requiresReview: true
    }).sort({ riskScore: -1 });
    
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
 * Approve receipt
 * POST /api/receipts/:id/approve
 */
async function approveReceipt(req, res) {
  try {
    const receipt = await Receipt.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: 'approved' },
      { new: true }
    );
    
    if (!receipt) {
      return res.status(404).json({
        success: false,
        error: 'Receipt not found'
      });
    }
    
    await AuditLog.create({
      userId: req.user.id,
      action: 'receipt_approved',
      entityType: 'receipt',
      entityId: receipt._id,
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
 * Reject receipt
 * POST /api/receipts/:id/reject
 */
async function rejectReceipt(req, res) {
  try {
    const receipt = await Receipt.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: 'rejected' },
      { new: true }
    );
    
    if (!receipt) {
      return res.status(404).json({
        success: false,
        error: 'Receipt not found'
      });
    }
    
    await AuditLog.create({
      userId: req.user.id,
      action: 'receipt_rejected',
      entityType: 'receipt',
      entityId: receipt._id,
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

module.exports = {
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
};
