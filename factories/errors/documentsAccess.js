const AppError = require('./AppError');

module.exports = class DocumentsAccessErrorsFactory {
  static documentsRequestAlreadySendErr() {
    return new AppError({
      message: 'You have already sent request for documents',
      statusCode: 400,
    });
  }
};
