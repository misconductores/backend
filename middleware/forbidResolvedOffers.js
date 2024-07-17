const {statusTypes} = require('../constants/usersConstants');
const {GeneralErrorsFactory, OffersErrors} = require('../factories');
const {OffersModel} = require('../models');
const {GeneralServices} = require('../services');

module.exports = async (req, res, next) => {
  try {
    const {id: offerId} = req.params;

    const {doc: offer} = await GeneralServices.findById({
      id: offerId,
      model: OffersModel,
    });

    if (!offer) return next(OffersErrors.noOfferErr());

    if (offer.status !== statusTypes.pending.value)
      return next(OffersErrors.requestResolvedErr());

    next();
  } catch (error) {
    return next(GeneralErrorsFactory.internalErr({error}));
  }
};
