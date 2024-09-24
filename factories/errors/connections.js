const AppError = require('./AppError');

module.exports = class ConnectionErrorsFactory {
  static alreadyConnectedErr() {
    return new AppError({
      message: 'Already connected to a company',
      statusCode: 400,
    });
  }
  static alreadyConnectedWithYouErr() {
    return new AppError({
      message: 'This driver is already connected to you',
      statusCode: 400,
    });
  }
};
