const ApiResponse = require('../utils/apiResponse.util');

module.exports = (err, req, res, _next) => {
  const status = err.status || 500;
  // INTENTIONAL VULN (SAST-20): stack exposed in response
  res.status(status).json(ApiResponse.error(err.message, err.code, err.stack, err.details));
};
