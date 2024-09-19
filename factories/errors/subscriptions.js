const AppError = require('./AppError');

module.exports = class SubscriptionsErrorsFactory {
  static subscriptionAlreadyExistErr() {
    return new AppError({
      message: 'Subscription already exist',
      statusCode: 400,
    });
  }
};
