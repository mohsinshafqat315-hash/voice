// Query utility - pagination + filtering helper
// Helps with MongoDB query building and pagination

/**
 * Build pagination options
 * @param {Object} query - Request query object
 * @returns {Object} Pagination options
 */
function buildPagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  
  return {
    page,
    limit,
    skip
  };
}

/**
 * Build date range filter
 * @param {Object} query - Request query object
 * @returns {Object} Date filter
 */
function buildDateFilter(query) {
  const filter = {};
  
  if (query.dateFrom || query.dateTo) {
    filter.date = {};
    if (query.dateFrom) {
      filter.date.$gte = new Date(query.dateFrom);
    }
    if (query.dateTo) {
      filter.date.$lte = new Date(query.dateTo);
    }
  }
  
  return filter;
}

/**
 * Build sort options
 * @param {Object} query - Request query object
 * @param {Object} defaultSort - Default sort
 * @returns {Object} Sort object
 */
function buildSort(query, defaultSort = { createdAt: -1 }) {
  if (!query.sort) return defaultSort;
  
  const sortField = query.sort.replace(/^-/, '');
  const sortOrder = query.sort.startsWith('-') ? -1 : 1;
  
  return { [sortField]: sortOrder };
}

/**
 * Build text search filter
 * @param {string} search - Search term
 * @param {Array<string>} fields - Fields to search
 * @returns {Object} Search filter
 */
function buildSearchFilter(search, fields = []) {
  if (!search || fields.length === 0) return {};
  
  return {
    $or: fields.map(field => ({
      [field]: { $regex: search, $options: 'i' }
    }))
  };
}

/**
 * Build filter object from query
 * @param {Object} query - Request query
 * @param {Object} options - Filter options
 * @returns {Object} MongoDB filter
 */
function buildFilter(query, options = {}) {
  const filter = {};
  
  // Add base filter if provided
  if (options.base) {
    Object.assign(filter, options.base);
  }
  
  // Date range
  const dateFilter = buildDateFilter(query);
  Object.assign(filter, dateFilter);
  
  // Exact match fields
  if (options.exactMatch) {
    for (const field of options.exactMatch) {
      if (query[field] !== undefined) {
        filter[field] = query[field];
      }
    }
  }
  
  // Search
  if (query.search && options.searchFields) {
    const searchFilter = buildSearchFilter(query.search, options.searchFields);
    Object.assign(filter, searchFilter);
  }
  
  return filter;
}

/**
 * Format paginated response
 * @param {Array} data - Data array
 * @param {number} total - Total count
 * @param {Object} pagination - Pagination options
 * @returns {Object} Formatted response
 */
function formatPaginatedResponse(data, total, pagination) {
  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit),
      hasNext: pagination.page * pagination.limit < total,
      hasPrev: pagination.page > 1
    }
  };
}

module.exports = {
  buildPagination,
  buildDateFilter,
  buildSort,
  buildSearchFilter,
  buildFilter,
  formatPaginatedResponse
};

