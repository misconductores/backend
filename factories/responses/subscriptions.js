const AppResponse = require('./AppResponse');

module.exports = class SubscriptionsResponsesFactory {
  static subscriptionActivatedSuccessfully() {
    return new AppResponse({
      message: 'Subscription activated successfully',
      statusCode: 201,
      body: {},
    });
  }
};
