const {
  roles,
  notificationTypes,
  statusTypes,
} = require('../constants/usersConstants');
const {
  UsersErrorsFactory,
  ConnectionErrors,
  OffersErrors,
  OffersResponsesFactory,
} = require('../factories');
const OfferResponsesFactory = require('../factories/responses/offers');
const {OffersModel} = require('../models');
const {
  UsersServices,
  ConnectionsServices,
  NotificationsServices,
  GeneralServices,
  OffersServices,
} = require('../services');

module.exports = class OffersController {
  static async sendOffer(req, res, next) {
    const {user} = await UsersServices.getUserById({
      id: req.jwtToken.user.id,
    });

    if (user?.role !== roles.company.value)
      return next(UsersErrorsFactory.forbiddenCompanyErr());

    const {driverId, jobId} = req.body;

    const findConnectionQuery = {
      driverId: driverId,
      companyId: user.id,
      isActive: true,
    };

    const {connection} = await ConnectionsServices.findConnection({
      query: findConnectionQuery,
    });

    if (connection) return next(ConnectionErrors.alreadyConnectedErr());

    const {doc: findOffer} = await GeneralServices.findOne({
      query: {
        jobId: jobId,
        driverId: driverId,
        companyId: user.id,
      },
      model: OffersModel,
    });

    if (findOffer) return next(OffersErrors.alreadySendOfferErr());

    const {
      success: response,
      error,
      doc: offer,
    } = await GeneralServices.create({
      data: {companyId: user.id, driverId, jobId},
      model: OffersModel,
    });

    if (response) {
      await NotificationsServices.createNotification({
        userId: driverId,
        relatedUserId: user.id,
        type: notificationTypes.send_offer.value,
      });

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
};
