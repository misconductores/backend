const {GeneralErrorsFactory, SubscriptionsErrors} = require('../factories');
const {SubscriptionsModel} = require('../models');
const {GeneralServices} = require('../services');

module.exports = async (req, res, next) => {
  try {
    const userId = req.jwtToken.user.id;

    const {doc: subscription} = await GeneralServices.findOne({
      query: {userId},
      model: SubscriptionsModel,
    });

    if (subscription)
      return next(SubscriptionsErrors.subscriptionAlreadyExistErr());

    next();
  } catch (error) {
    return next(GeneralErrorsFactory.internalErr({error}));
  }
};
