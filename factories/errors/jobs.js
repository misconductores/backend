const AppError = require('./AppError');

module.exports = class JobErrorsFactory {
  static jobCreateErr() {
    return new AppError({
      message: 'Job creation failed',
      statusCode: 400,
    });
  }
  static jobNotFoundErr() {
    return new AppError({
      message: 'Jobs not found!',
      statusCode: 400,
    });
  }
  static jobByIdNotFoundErr() {
    return new AppError({
      message: 'Job not found against this id!',
      statusCode: 400,
    });
  }
};
