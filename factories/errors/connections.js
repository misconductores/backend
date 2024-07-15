const AppError = require('./AppError');

module.exports = class ConnectionErrorsFactory {
  static alreadyConnectedErr() {
    return new AppError({
      message: 'Already connected to a company',
      statusCode: 400,
    });
  }
};
