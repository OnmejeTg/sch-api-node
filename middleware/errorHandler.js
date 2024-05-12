const globalErrorHandler = (err, req, res, next) => {
    const { stack, message } = err;
    const status = err.status || "Failed";
    const statusCode = err.statusCode || 500;
  
    res.status(statusCode).json({ status, message, stack });
  };
  
  const notFoundHandler = (req, res, next) => {
    const err = new Error(`${req.originalUrl} not found`);
    err.status = 404;
    next(err);
  };
  

export { globalErrorHandler, notFoundHandler };
