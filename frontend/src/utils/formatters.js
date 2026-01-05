// Formatter utilities - currency, date, number formatting
// Formats amounts, dates, percentages for display

import { format, parseISO } from 'date-fns';

/**
 * Format currency amount
 */
export function formatCurrency(amount, currency = 'USD', options = {}) {
  const symbols = {
    USD: '$',
    EUR: '€',
    PKR: '₨',
    GBP: '£'
  };
  
  const symbol = symbols[currency] || currency;
  const decimals = options.decimals !== undefined ? options.decimals : 2;
  const formattedAmount = parseFloat(amount || 0).toFixed(decimals);
  
  if (options.showSymbol === false) {
    return formattedAmount;
  }
  
  return `${symbol}${formattedAmount}`;
}

/**
 * Format date
 */
export function formatDate(date, formatStr = 'MMM dd, yyyy') {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    return format(dateObj, formatStr);
  } catch (error) {
    return 'Invalid Date';
  }
}

/**
 * Format date range
 */
export function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return 'N/A';
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

/**
 * Format number with commas
 */
export function formatNumber(number, decimals = 0) {
  if (number === null || number === undefined) return '0';
  return parseFloat(number).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format percentage
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined) return '0%';
  return `${parseFloat(value).toFixed(decimals)}%`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date) {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    const now = new Date();
    const diffMs = now - dateObj;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return formatDate(dateObj);
  } catch (error) {
    return 'Invalid Date';
  }
}

/**
 * Truncate text
 */
export function truncate(text, maxLength = 50, suffix = '...') {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

export default {
  formatCurrency,
  formatDate,
  formatDateRange,
  formatNumber,
  formatPercentage,
  formatFileSize,
  formatRelativeTime,
  truncate
};
