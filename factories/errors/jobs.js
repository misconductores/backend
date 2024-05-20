const AppError = require('./AppError');

module.exports = class JobErrorsFactory {
  static jobCreateErr() {
    return new AppError({
      message: 'Job creation failed',
      statusCode: 400,
    });
  }
};
