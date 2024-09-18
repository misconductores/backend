const AppError = require('./AppError');

module.exports = class SubscriptionsErrorsFactory {
  static subscriptionActivationFailed() {
    return new AppError({
      message: 'Subscription activation failed',
      statusCode: 400,
    });
  }
};
