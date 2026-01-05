// Response utility - standardizes API responses
// Ensures consistent response format across all endpoints

/**
 * Send a successful response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Optional success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
function sendSuccess(res, data = null, message = null, statusCode = 200) {
  const response = {
    success: true
  };

  if (data !== null) {
    response.data = data;
  }

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} error - Error message (user-friendly)
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {string} code - Optional error code for client handling
 * @param {*} details - Optional additional error details
 */
function sendError(res, error, statusCode = 400, code = null, details = null) {
  const response = {
    success: false,
    error: error || 'An error occurred'
  };

  if (code) {
    response.code = code;
  }

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send a paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 */
function sendPaginated(res, data, total, page, limit) {
  return sendSuccess(res, {
    items: data,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  });
}

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated
};

