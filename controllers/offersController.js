const {statusTypes} = require('../constants/usersConstants');
const {OffersResponsesFactory, OffersErrors} = require('../factories');
const OfferResponsesFactory = require('../factories/responses/offers');
const {OffersModel} = require('../models');
const {OffersServices} = require('../services');

module.exports = class OffersController {
  static async sendOffer(req, res, next) {
    const userId = req.jwtToken.user.id;

    const {driverId, jobId} = req.body;
    const {isOfferSendToApplicant} = req.query;

    const findOffer = await OffersModel.findOne({
      jobId: jobId,
      driverId: driverId,
      companyId: userId,
      status: statusTypes.pending.value,
    });

    if (findOffer?.status === statusTypes.pending.value)
      return next(OffersErrors.alreadySendOfferErr());

    const {
      success: response,
      error,
      offer,
    } = await OffersServices.sendOffer({
      userId,
      driverId,
      jobId,
      isOfferSendToApplicant,
    });

    if (response) {
      return next(OffersResponsesFactory.offerSendSuccessfully({offer}));
    }

    if (error) throw error;
  }

  static async acceptOffer(req, res, next) {
    const userId = req.jwtToken.user.id;

    const {id: offerId} = req.params;

    const {success, connection, err} = await OffersServices.acceptOffer({
      offerId,
      userId,
    });

    if (success) {
      return next(
        OfferResponsesFactory.offerAcceptedSuccessfully({connection})
      );
    }

    if (err) throw err;
  }

  static async rejectOffer(req, res, next) {
    const userId = req.jwtToken.user.id;

    const {id: offerId} = req.params;

    const {success, error} = await OffersServices.rejectOffer({
      offerId,
      userId,
    });

    if (success) {
      return next(OfferResponsesFactory.offerRejectedSuccessfully());
    }

    if (error) throw error;
  }

  static async getOffersByJobId(req, res, next) {
    const {jobId} = req.params;

    let {page, limit} = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const {success, err, offers} = await OffersServices.getOffersByJobId({
      page,
      limit,
      jobId,
    });

    if (success)
      return next(
        OffersResponsesFactory.offerRetrievedSuccessfully({
          count: offers.totalCount,
          data: offers.data,
          page: page,
          perPage: limit,
        })
      );

    if (err) throw err;
  }

  static async getOffersByDriverId(req, res, next) {
    const userId = req.jwtToken.user.id;

    let {page, limit} = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const {success, err, offers} = await OffersServices.getOffersByDriverId({
      page,
      limit,
      driverId: userId,
    });

    if (success)
      return next(
        OffersResponsesFactory.offerRetrievedSuccessfully({
          count: offers.totalCount,
          data: offers.data,
          page: page,
          perPage: limit,
        })
      );

    if (err) throw err;
  }

  static async withdrawOfferById(req, res, next) {
    const {id: offerId} = req.params;

    const {success, error} = await OffersServices.withdrawOfferById({offerId});

    if (success)
      return next(OffersResponsesFactory.offerWithdrawnSuccessfully());

    if (error) throw error;
  }
};
