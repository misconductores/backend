const AppError = require('./AppError');

module.exports = class OfferErrorsFactory {
  static alreadySendOfferErr() {
    return new AppError({
      message: 'You have already sent offer to this driver',
      statusCode: 400,
    });
  }
  static requestResolvedErr() {
    return new AppError({
      message: 'This request is already resolved',
      statusCode: 400,
    });
  }
  static noOfferErr() {
    return new AppError({
      message: 'No offer found against this id',
      statusCode: 400,
    });
  }
};
