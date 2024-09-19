const {SubscriptionsResponsesFactory} = require('../factories');
const {SubscriptionServices} = require('../services');

module.exports = class SubscriptionsController {
  static async activateFreeSubscription(req, res, next) {
    const userId = req.jwtToken.user.id;

    const {success, error, subscription} =
      await SubscriptionServices.activateFreeSubscription({userId});

    if (success)
      return next(
        SubscriptionsResponsesFactory.subscriptionActivatedSuccessfully({
          subscription,
        })
      );

    if (error) throw error;
  }
};
