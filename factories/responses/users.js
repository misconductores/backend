const config = require('config');

const AppResponse = require('./AppResponse');

module.exports = class UsersResponsesFactory {
  constructor() {}

  static userRegisteredSuccessfully({user}) {
    return new AppResponse({
      message: 'User registered successfully',
      statusCode: 201,
      body: {user},
    });
  }

  static userLoggedInSuccessfully({user, isLoginRequest}) {
    return new AppResponse({
      message: 'User logged in successfully',
      statusCode: 200,
      body: {user, isLoginRequest},
    });
  }

  static singleUserInfoRetrievedRes({user} = {}) {
    return new AppResponse({
      message: 'User info retrieved successfully',
      statusCode: 200,
      body: {user},
    });
  }

  static postalCodeInfoRes({data} = {}) {
    return new AppResponse({
      message: 'Postal codes retrieved successfully',
      statusCode: 200,
      body: {data},
    });
  }

  static updateUserProfilePicRes({user} = {}) {
    return new AppResponse({
      message: 'User profile image updated successfully',
      statusCode: 200,
      body: {user},
    });
  }

  static updateDocumentRes({user} = {}) {
    return new AppResponse({
      message: 'Document uploaded successfully',
      statusCode: 200,
      body: {user},
    });
  }

  static uploadPreRegisterDocumentRes({document} = {}) {
    return new AppResponse({
      message: 'Document uploaded successfully',
      statusCode: 200,
      body: {document},
    });
  }

  static deleteDocumentRes({user} = {}) {
    return new AppResponse({
      message: 'Document deleted successfully',
      statusCode: 200,
      body: {user},
    });
  }

  static deletePreRegisterDocumentRes({user} = {}) {
    return new AppResponse({
      message: 'Document deleted successfully',
      statusCode: 200,
    });
  }

  static profileUpdateRes({user} = {}) {
    return new AppResponse({
      message: 'Profile updated successfully',
      statusCode: 200,
      body: {user},
    });
  }

  static resetPasswordLinkGeneratedSuccessfully({resetToken, resetUrl}) {
    return new AppResponse({
      message: 'Reset password link sent successfully',
      statusCode: 200,
      body: {resetToken, resetUrl},
    });
  }

  static passwordResetSuccessfully() {
    return new AppResponse({
      statusCode: 200,
      message: 'Password reset successfully',
      body: {},
    });
  }

  static logoutSuccessfully() {
    return new AppResponse({
      statusCode: 200,
      message: 'Logout successfully',
      body: {},
    });
  }

  static userVerifiedSuccessfully() {
    return new AppResponse({
      statusCode: 200,
      message: 'User verified successfully',
      body: {},
    });
  }

  static resendVerificationEmail() {
    return new AppResponse({
      statusCode: 200,
      message: 'Email Verification sent successfully',
      body: {},
    });
  }
  static driversRetrievedSuccessfully({count, data, page, perPage}) {
    return new AppResponse({
      message: 'Driver list retrieved successfully',
      statusCode: 200,
      body: {count, data, page, perPage},
    });
  }
  static companyRetrievedSuccessfully({count, data, page, perPage}) {
    return new AppResponse({
      message: 'Company list retrieved successfully',
      statusCode: 200,
      body: {count, data, page, perPage},
    });
  }
  static emailAvailable() {
    return new AppResponse({
      statusCode: 200,
      message: 'Email is available',
      body: {},
    });
  }
};
