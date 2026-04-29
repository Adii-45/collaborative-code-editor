/**
 * Global error handler middleware.
 * Catches errors thrown by controllers and returns a consistent JSON response.
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // Default to 500 if no status code was set
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    // Only include stack trace in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

export default errorHandler;
