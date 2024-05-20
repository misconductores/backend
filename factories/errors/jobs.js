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
      message: 'Jobs not found',
      statusCode: 400,
    });
  }
  static jobByIdNotFoundErr() {
    return new AppError({
      message: 'Job not found against this id',
      statusCode: 400,
    });
  }
  static jobUpdateErr() {
    return new AppError({
      message: 'Job updated failed',
      statusCode: 400,
    });
  }
  static jobDeleteErr() {
    return new AppError({
      message: 'Job delete failed',
      statusCode: 400,
    });
  }
  static driverNotFoundErr() {
    return new AppError({
      message: 'Drivers not found',
      statusCode: 400,
    });
  }
  static companyNotFoundErr() {
    return new AppError({
      message: 'Company not found',
      statusCode: 400,
    });
  }
};
