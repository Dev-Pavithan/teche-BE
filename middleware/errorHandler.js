
const errorHandler = (err, req, res, next) => {
    // Log the error stack trace for debugging
    console.error(err.stack);
  
    // Set the status code based on the error or default to 500
    const statusCode = err.status || 500;
  
    // Respond with a JSON object containing the error message
    res.status(statusCode).json({
      error: {
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) // Include stack trace in development mode
      }
    });
  };
  
  export default errorHandler;
  