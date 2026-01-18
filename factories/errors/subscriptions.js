const AppError = require('./AppError');

module.exports = class SubscriptionsErrorsFactory {
  static subscriptionAlreadyExistErr() {
    return new AppError({
      message: 'Subscription already exist',
      statusCode: 400,
    });
  }
  static unhandledEventErr() {
    return new AppError({
      message: 'Unhandled Event',
      statusCode: 400,
    });
  }
};
