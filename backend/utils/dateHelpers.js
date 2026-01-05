// Date helper utilities - date manipulation and formatting
// Date parsing, range calculations, timezone handling

/**
 * Format date to YYYY-MM-DD
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

/**
 * Parse date string to Date object
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @returns {Date|null} Date object or null
 */
function parseDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Get start of day
 * @param {Date} date - Date
 * @returns {Date} Start of day
 */
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day
 * @param {Date} date - Date
 * @returns {Date} End of day
 */
function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Get start of month
 * @param {Date} date - Date
 * @returns {Date} Start of month
 */
function startOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  return startOfDay(d);
}

/**
 * Get end of month
 * @param {Date} date - Date
 * @returns {Date} End of month
 */
function endOfMonth(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return endOfDay(d);
}

/**
 * Get date range for period
 * @param {string} period - Period (today, week, month, year, custom)
 * @param {Object} customRange - Custom range {from, to}
 * @returns {Object} Date range {from, to}
 */
function getDateRange(period, customRange = {}) {
  const now = new Date();
  let from, to;
  
  switch (period) {
    case 'today':
      from = startOfDay(now);
      to = endOfDay(now);
      break;
    case 'week':
      from = new Date(now);
      from.setDate(now.getDate() - 7);
      from = startOfDay(from);
      to = endOfDay(now);
      break;
    case 'month':
      from = startOfMonth(now);
      to = endOfMonth(now);
      break;
    case 'year':
      from = new Date(now.getFullYear(), 0, 1);
      to = new Date(now.getFullYear(), 11, 31);
      from = startOfDay(from);
      to = endOfDay(to);
      break;
    case 'custom':
      from = customRange.from ? parseDate(customRange.from) : null;
      to = customRange.to ? parseDate(customRange.to) : null;
      if (from) from = startOfDay(from);
      if (to) to = endOfDay(to);
      break;
    default:
      from = null;
      to = null;
  }
  
  return { from, to };
}

/**
 * Check if date is in range
 * @param {Date} date - Date to check
 * @param {Date} from - Start date
 * @param {Date} to - End date
 * @returns {boolean} True if in range
 */
function isDateInRange(date, from, to) {
  if (!date) return false;
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return false;
  
  if (from && d < from) return false;
  if (to && d > to) return false;
  
  return true;
}

/**
 * Get days difference between dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} Days difference
 */
function daysDifference(date1, date2) {
  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Add days to date
 * @param {Date|string} date - Date
 * @param {number} days - Days to add
 * @returns {Date} New date
 */
function addDays(date, days) {
  const d = date instanceof Date ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Format date for display
 * @param {Date|string} date - Date
 * @param {string} locale - Locale (default: en-US)
 * @returns {string} Formatted string
 */
function formatDateDisplay(date, locale = 'en-US') {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(locale);
}

module.exports = {
  formatDate,
  parseDate,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  getDateRange,
  isDateInRange,
  daysDifference,
  addDays,
  formatDateDisplay
};
