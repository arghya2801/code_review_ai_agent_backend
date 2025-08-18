import multer from 'multer';

// Global error handling middleware
export const errorHandler = (error, req, res, next) => {
  // Handle Multer errors
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB.',
          error: 'FILE_TOO_LARGE'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum allowed is 5 files.',
          error: 'TOO_MANY_FILES'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected field name. Use "file" for single upload or "files" for multiple upload.',
          error: 'UNEXPECTED_FIELD'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error occurred.',
          error: error.code || 'UPLOAD_ERROR'
        });
    }
  }

  // Handle file type validation errors
  if (error.message && error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message,
      error: 'INVALID_FILE_TYPE'
    });
  }

  // Handle general errors
  console.error('Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? error.stack : 'INTERNAL_SERVER_ERROR'
  });
};

// 404 handler for undefined routes
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    error: 'ROUTE_NOT_FOUND'
  });
};
