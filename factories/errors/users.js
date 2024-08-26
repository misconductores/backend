const {errorCodes} = require('../../constants/usersConstants');
const AppError = require('./AppError');

module.exports = class UsersErrorsFactory {
  static userAlreadyRegisteredErr() {
    return new AppError({
      message: 'user already registered',
      statusCode: 400,
    });
  }

  static userNotFoundErr() {
    return new AppError({
      message: 'user not found',
      statusCode: 404,
    });
  }
  static forbiddenCompanyErr() {
    return new AppError({
      message: 'Only company profiles are allowed to proceed this request',
      statusCode: 403,
      err: {
        type: errorCodes.ONLY_COMPANY_ALLOWED,
      },
    });
  }

  static postalCodesFoundErr() {
    return new AppError({
      message: 'No address found against this postal code',
      statusCode: 404,
    });
  }

  static profileImgUpdateErr() {
    return new AppError({
      message: 'Profile image update failed',
      statusCode: 400,
    });
  }

  static documentUpdateErr() {
    return new AppError({
      message: 'Document update failed',
      statusCode: 400,
    });
  }
  static documentLabelErr() {
    return new AppError({
      message: 'Document with given label already exist',
      statusCode: 404,
    });
  }
  static documentUploadErr() {
    return new AppError({
      message: 'Document upload failed',
      statusCode: 400,
    });
  }

  static documentDeleteErr() {
    return new AppError({
      message: 'Document delete failed',
      statusCode: 400,
    });
  }

  static profileUpdateErr() {
    return new AppError({
      message: 'Profile updating failed',
      statusCode: 400,
    });
  }

  static wrongEmailOrPasswordErr() {
    return new AppError({
      message: 'wrong credentials',
      statusCode: 401,
    });
  }

  static loginResetTokenErr() {
    return new AppError({
      message:
        'Token is either expired or is invalid. Please create a new token and try again',
      statusCode: 400,
      err: {
        type: errorCodes.INVALID_TOKEN_ERR,
      },
    });
  }

  static loginResetTokenUserErr() {
    return new AppError({
      message:
        'Password reset failed. Either the reset link is already used or the user is deleted',
      statusCode: 400,
    });
  }

  static userNotVerifiedErr() {
    return new AppError({
      message: 'User Not Verified',
      statusCode: 403,
      err: {
        type: errorCodes.USER_NOT_VERIFIED,
      },
    });
  }

  static userAlreadyVerifiedErr() {
    return new AppError({
      message: 'user already verified',
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
  static emailAlreadyExistErr() {
    return new AppError({
      message: 'Email is already exist',
      statusCode: 400,
    });
  }
  static alreadyBlockedErr() {
    return new AppError({
      message: 'You have already blocked this user',
      statusCode: 400,
    });
  }
  static alreadyUnBlockedErr() {
    return new AppError({
      message: 'You have already unblocked this user',
      statusCode: 400,
    });
  }
  static roleOtherThanDriverBlockErr() {
    return new AppError({
      message: 'You are not allowed to block others except drivers',
      statusCode: 403,
    });
  }
};
