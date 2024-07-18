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
  static offerExpiredErr() {
    return new AppError({
      message: 'Offer has been expired',
      statusCode: 400,
    });
  }
  static offerAfterDaysErr({day}) {
    return new AppError({
      message: `This driver already has rejected your offer. You can send offer after ${day} ${
        day === 1 ? 'day' : 'days'
      } to this driver`,
      statusCode: 400,
    });
  }
};
