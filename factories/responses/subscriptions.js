const AppResponse = require('./AppResponse');

module.exports = class SubscriptionsResponsesFactory {
  static subscriptionActivatedSuccessfully({subscription}) {
    return new AppResponse({
      message: 'Subscription activated successfully',
      statusCode: 201,
      body: {subscription},
    });
  }
  static eventCallSuccessfully() {
    return new AppResponse({
      message: 'Event call successfully',
      statusCode: 200,
      body: {},
    });
  }
  static checkoutCreatedSuccessfully({subscription}) {
    return new AppResponse({
      message: 'Checkout created successfully',
      statusCode: 200,
      body: {subscription},
    });
  }
  static subscriptionRetrievedSuccessfully({subscription}) {
    return new AppResponse({
      message: 'Subscription retrieved successfully',
      statusCode: 200,
      body: {subscription},
    });
  }
  static plansRetrievedSuccessfully({plans}) {
    return new AppResponse({
      message: 'Plans retrieved successfully',
      statusCode: 200,
      body: {plans},
    });
  }
};
