
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    const statusCode = err.status || 500;
  
    res.status(statusCode).json({
      error: {
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) 
      }
    });
  };
  
  export default errorHandler;
  