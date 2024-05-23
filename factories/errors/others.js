const AppError = require('./AppError');

module.exports = class OthersErrorFactory {
  static cityFoundErr() {
    return new AppError({
      message: 'No city found',
      statusCode: 404,
    });
  }
};
