const generateRequestId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const responseMiddleware = (req, res, next) => {
  req.requestId = generateRequestId();

  res.success = (data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  };

  res.fail = (message = 'Operation failed', statusCode = 400, errors = null) => {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  };

  next();
};

module.exports = responseMiddleware;
