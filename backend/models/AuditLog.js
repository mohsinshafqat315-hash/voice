// Audit log model - MongoDB schema for audit trail
// Tracks all important actions and changes

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'receipt_uploaded',
      'receipt_approved',
      'receipt_rejected',
      'receipt_deleted',
      'subscription_created',
      'subscription_updated',
      'subscription_canceled',
      'payment_processed',
      'user_created',
      'user_updated',
      'settings_changed',
      'report_exported',
      'admin_action'
    ]
  },
  entityType: {
    type: String,
    enum: ['receipt', 'user', 'payment', 'subscription', 'report']
  },
  entityId: mongoose.Schema.Types.ObjectId,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  riskScore: Number
}, {
  timestamps: true
});

// Indexes for efficient queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
