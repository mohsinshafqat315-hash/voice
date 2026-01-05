// Frontend constants - API endpoints, status codes, default values
// Application-wide constants for frontend

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me'
  },
  RECEIPTS: {
    BASE: '/receipts',
    UPLOAD: '/receipts/upload',
    REVIEW: '/receipts/review'
  },
  REPORTS: {
    SUMMARY: '/reports/summary',
    EXPORT: '/reports/export',
    AUDIT: '/reports/audit'
  },
  PAYMENTS: {
    CHECKOUT: '/payments/create-checkout',
    PORTAL: '/payments/create-portal',
    PLANS: '/payments/plans'
  }
};

export const RECEIPT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FLAGGED: 'flagged'
};

export const RISK_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High'
};

export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PRO: 'pro',
  BUSINESS: 'business',
  ENTERPRISE: 'enterprise'
};

export const PLAN_LIMITS = {
  free: {
    receipts: 10,
    features: ['Basic OCR', 'AI Analysis', 'Dashboard']
  },
  pro: {
    receipts: 100,
    features: ['Advanced OCR', 'AI Analysis', 'Dashboard', 'Reports', 'Export']
  },
  business: {
    receipts: 1000,
    features: ['Advanced OCR', 'AI Analysis', 'Dashboard', 'Reports', 'Export', 'Audit Reports', 'API Access']
  },
  enterprise: {
    receipts: -1, // unlimited
    features: ['All Features', 'Custom Integration', 'Priority Support', 'Dedicated Account Manager']
  }
};

export const CURRENCIES = ['USD', 'EUR', 'PKR'];

export const DATE_FORMATS = {
  SHORT: 'MM/DD/YYYY',
  LONG: 'MMMM DD, YYYY',
  ISO: 'YYYY-MM-DD'
};

export const FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
  PDF: ['application/pdf'],
  ALL: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

export default {
  API_ENDPOINTS,
  RECEIPT_STATUS,
  RISK_LEVELS,
  SUBSCRIPTION_PLANS,
  PLAN_LIMITS,
  CURRENCIES,
  DATE_FORMATS,
  FILE_TYPES,
  MAX_FILE_SIZE,
  PAGINATION,
  THEMES
};
