const {
  subscriptionStatuses,
  subscriptionModes,
} = require('../constants/usersConstants');
const {GeneralErrorsFactory, SubscriptionsErrors} = require('../factories');
const {SubscriptionsModel} = require('../models');
const {GeneralServices} = require('../services');

module.exports =
  ({subscriptionMode}) =>
  async (req, res, next) => {
    try {
      const userId = req.jwtToken.user.id;

      const isFreeSubscriptionMode =
        subscriptionMode === subscriptionModes.free.value;

      const {doc: subscription} = await GeneralServices.findOne({
        query: {
          userId,
          status: subscriptionStatuses.active.value,
          subscriptionMode: isFreeSubscriptionMode
            ? subscriptionModes.free.value
            : subscriptionModes.paid.value,
        },
        model: SubscriptionsModel,
      });

      if (subscription)
        return next(SubscriptionsErrors.subscriptionAlreadyExistErr());

      next();
    } catch (error) {
      return next(GeneralErrorsFactory.internalErr({error}));
    }
  };
