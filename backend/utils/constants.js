// Constants file - application-wide constants
// Status codes, error messages, default values, configuration constants

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500
};

const RECEIPT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FLAGGED: 'flagged'
};

const RISK_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High'
};

const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PRO: 'pro',
  BUSINESS: 'business',
  ENTERPRISE: 'enterprise'
};

const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  TRIALING: 'trialing',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  INCOMPLETE: 'incomplete'
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

const AUDIT_ACTIONS = {
  RECEIPT_UPLOADED: 'receipt_uploaded',
  RECEIPT_APPROVED: 'receipt_approved',
  RECEIPT_REJECTED: 'receipt_rejected',
  RECEIPT_DELETED: 'receipt_deleted',
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_UPDATED: 'subscription_updated',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',
  PAYMENT_PROCESSED: 'payment_processed',
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  SETTINGS_CHANGED: 'settings_changed',
  REPORT_EXPORTED: 'report_exported',
  ADMIN_ACTION: 'admin_action'
};

const EXPENSE_CATEGORIES = [
  'Office Supplies',
  'Travel',
  'Meals & Entertainment',
  'Software & Subscriptions',
  'Professional Services',
  'Utilities',
  'Marketing & Advertising',
  'Equipment',
  'Training & Education',
  'Insurance',
  'Rent',
  'Other'
];

const CURRENCIES = ['USD', 'EUR', 'PKR', 'GBP'];

const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100
};

const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.pdf']
};

const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  SERVER_ERROR: 'Internal server error',
  DUPLICATE_ENTRY: 'Duplicate entry',
  INVALID_CREDENTIALS: 'Invalid credentials',
  TOKEN_EXPIRED: 'Token expired',
  FILE_TOO_LARGE: 'File size exceeds limit',
  INVALID_FILE_TYPE: 'Invalid file type'
};

const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  UPLOADED: 'File uploaded successfully',
  PROCESSED: 'Receipt processed successfully'
};

module.exports = {
  HTTP_STATUS,
  RECEIPT_STATUS,
  RISK_LEVELS,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUS,
  PAYMENT_STATUS,
  AUDIT_ACTIONS,
  EXPENSE_CATEGORIES,
  CURRENCIES,
  DEFAULT_PAGINATION,
  FILE_UPLOAD,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};
