// Report database schema definition
// MongoDB/Supabase schema structure for reports collection/table

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['expense', 'tax', 'audit', 'custom'],
    required: true,
    index: true
  },
  dateRange: {
    from: { type: Date, required: true },
    to: { type: Date, required: true }
  },
  filters: {
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High'] },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'flagged'] },
    category: String,
    currency: { type: String, enum: ['USD', 'EUR', 'PKR', 'GBP'] }
  },
  data: {
    totalReceipts: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    byCategory: mongoose.Schema.Types.Mixed,
    byMonth: mongoose.Schema.Types.Mixed,
    riskDistribution: mongoose.Schema.Types.Mixed
  },
  format: {
    type: String,
    enum: ['csv', 'pdf', 'excel'],
    default: 'csv'
  },
  fileUrl: String,
  exportedAt: Date
}, {
  timestamps: true
});

// Indexes
reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ userId: 1, type: 1 });
reportSchema.index({ 'dateRange.from': 1, 'dateRange.to': 1 });

module.exports = reportSchema;
