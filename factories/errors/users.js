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

  static documentDeleteErr() {
    return new AppError({
      message: 'Document delete failed',
      statusCode: 404,
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
        type: 'USER_NOT_VERIFIED',
      },
    });
  }

  static userAlreadyVerifiedErr() {
    return new AppError({
      message: 'user already verified',
      statusCode: 400,
    });
  }
};
