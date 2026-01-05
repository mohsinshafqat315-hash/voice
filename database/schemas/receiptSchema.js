// Receipt database schema definition
// MongoDB/Supabase schema structure for receipts collection/table

const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  quantity: { type: Number, default: 1, min: 0 },
  unit_price: { type: Number, required: true, min: 0 },
  tax: { type: Number, default: 0, min: 0 }
}, { _id: false });

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
    trim: true,
    index: true
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
    enum: ['USD', 'EUR', 'PKR', 'GBP'],
    default: 'USD'
  },
  VAT_ID: {
    type: String,
    trim: true,
    index: true
  },
  invoice_number: {
    type: String,
    trim: true,
    index: true
  },
  line_items: [lineItemSchema],
  category: {
    type: String,
    trim: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending',
    index: true
  },
  ocrData: {
    rawText: String,
    confidence: { type: Number, min: 0, max: 1 },
    processedAt: Date
  },
  aiAnalysis: {
    risk_score: { type: Number, min: 0, max: 100 },
    risk_level: { type: String, enum: ['Low', 'Medium', 'High'] },
    alerts: [String],
    suggested_corrections: [mongoose.Schema.Types.Mixed],
    confidence_score: { type: Number, min: 0, max: 1 },
    compliance_status: String,
    requires_review: { type: Boolean, default: false }
  },
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  mimeType: String,
  notes: String,
  tags: [String]
}, {
  timestamps: true
});

// Indexes for efficient queries
receiptSchema.index({ userId: 1, date: -1 });
receiptSchema.index({ userId: 1, status: 1 });
receiptSchema.index({ userId: 1, 'aiAnalysis.risk_level': 1 });
receiptSchema.index({ userId: 1, category: 1 });
receiptSchema.index({ vendor: 1, date: 1, total: 1 }); // For duplicate detection

module.exports = receiptSchema;
