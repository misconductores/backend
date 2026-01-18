const {errorCodes} = require('../../constants/usersConstants');
const AppError = require('./AppError');

module.exports = class DocumentsAccessErrorsFactory {
  static documentsRequestAlreadySendErr() {
    return new AppError({
      message: 'You have already sent request for documents',
      statusCode: 400,
    });
  }
  static requestResolvedErr() {
    return new AppError({
      message: 'This request is already resolved',
      statusCode: 400,
    });
  }
  static forbiddenDocRequestErr() {
    return new AppError({
      message: 'You are not allowed to request for documents in free mode',
      statusCode: 403,
      err: {
        type: errorCodes.DOCS_ACCESS_REQ_NOT_ALLOWED,
      },
    });
  }
};
