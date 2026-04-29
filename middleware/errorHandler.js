const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  if (err.name === 'ValidationError' || err.name === 'CastError') statusCode = 400;
  if (err.code === 11000) {
    statusCode = 409;
  }

  let message = err.message || 'Internal Server Error';
  if (err.code === 11000) {
    const key = err.keyPattern ? Object.keys(err.keyPattern)[0] : 'field';
    message =
      key === 'email'
        ? 'This email is already registered. Try signing in or use a different email.'
        : 'Duplicate value — that record already exists.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
