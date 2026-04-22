module.exports = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (!error) {
      return next();
    }

    const details = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    const validationError = new Error('Validation failed');
    validationError.status = 400;
    validationError.code = 'VALIDATION_ERROR';
    validationError.details = details;

    return next(validationError);
  };
};
