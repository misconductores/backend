const {errorCodes} = require('../../constants/usersConstants');
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
  static applicantAlreadyExist() {
    return new AppError({
      message: 'Applicant already exist',
      statusCode: 400,
    });
  }
  static forbiddenJobPostErr() {
    return new AppError({
      message: 'Only one job allowed in free mode',
      statusCode: 403,
      err: {
        type: errorCodes.ONLY_ONE_JOB_ALLOWED,
      },
    });
  }
};
