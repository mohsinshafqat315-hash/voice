// Receipt model - MongoDB schema for receipts
// Fields: amount, date, merchant, category, tax, status, userId, ocrData, aiAnalysis

const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  item: String,
  quantity: Number,
  unit_price: Number,
  tax: Number
});

const receiptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  vendor: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'EUR', 'PKR'],
    default: 'USD'
  },
  VAT_ID: {
    type: String,
    trim: true
  },
  invoice_number: {
    type: String,
    trim: true,
    index: true
  },
  line_items: [lineItemSchema],
  category: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  // OCR Data
  ocrData: {
    rawText: String,
    confidence: Number,
    processedAt: Date
  },
  // AI Analysis
  aiAnalysis: {
    risk_score: { type: Number, min: 0, max: 100 },
    risk_level: { type: String, enum: ['Low', 'Medium', 'High'] },
    alerts: [String],
    suggested_corrections: [mongoose.Schema.Types.Mixed],
    confidence_score: { type: Number, min: 0, max: 1 },
    compliance_status: String,
    requires_review: { type: Boolean, default: false }
  },
  // File storage
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  mimeType: String,
  // Notes
  notes: String,
  tags: [String]
}, {
  timestamps: true
});

// Indexes for efficient queries
receiptSchema.index({ userId: 1, date: -1 });
receiptSchema.index({ userId: 1, status: 1 });
receiptSchema.index({ userId: 1, 'aiAnalysis.risk_level': 1 });

module.exports = mongoose.model('Receipt', receiptSchema);
