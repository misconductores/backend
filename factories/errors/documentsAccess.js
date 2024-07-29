const AppError = require('./AppError');

module.exports = class DocumentsAccessErrorsFactory {
  static documentsRequestAlreadySendErr() {
    return new AppError({
      message: 'You have already sent request for documents',
      statusCode: 400,
    });
  }
  static docsAccessRequestAfterDaysErr({day}) {
    return new AppError({
      message: `This user already has rejected the request. You can send request after ${day} ${
        day === 1 ? 'day' : 'days'
      } to this driver`,
      statusCode: 400,
    });
  }
};
