// Logging middleware - request/response logging
// Logs API calls, errors, performance metrics

const logger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

module.exports = logger;
