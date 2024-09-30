const {stripeEvents} = require('../constants/usersConstants');
const {SubscriptionsResponsesFactory, AuthErrors} = require('../factories');
const {SubscriptionsModel} = require('../models');
const {SubscriptionServices, GeneralServices} = require('../services');
const StripeUtils = require('../utils/stripeUtils');

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

  static async webhook(req, res, next) {
    const {success, event} = await StripeUtils.verifyWebhookSignature({req});

    if (!success) return next(AuthErrors.unauthorized());

    if (event.type === stripeEvents.invoicePaid.value)
      await SubscriptionServices.handleInvoicePaidEvent({
        data: event.data.object,
      });

    return next(SubscriptionsResponsesFactory.eventCallSuccessfully());
  }

  static async prepareSubscription(req, res, next) {
    const {fullName, email} = req.jwtToken.user;
    const {subscriptionPlanId} = req.body;

    const prepareSubscription =
      await SubscriptionServices.activateProSubscription({
        subscriptionPlanId,
        email,
        name: fullName,
      });

    if (!prepareSubscription.success) throw prepareSubscription.err;

    return next(
      SubscriptionsResponsesFactory.checkoutCreatedSuccessfully({
        subscription: prepareSubscription.subscription,
      })
    );
  }

  static async getUserSubscription(req, res, next) {
    const userId = req.jwtToken.user.id;

    const {
      doc: subscription,
      success,
      error,
    } = await GeneralServices.findOne({
      query: {userId},
      model: SubscriptionsModel,
    });

    if (success)
      return next(
        SubscriptionsResponsesFactory.subscriptionRetrievedSuccessfully({
          subscription,
        })
      );

    if (error) throw error;
  }

  static async getPlans(req, res, next) {
    const {success, err, products} = await StripeUtils.getProducts();

    if (success)
      return next(
        SubscriptionsResponsesFactory.plansRetrievedSuccessfully({
          plans: products,
        })
      );

    if (err) throw err;
  }
};
