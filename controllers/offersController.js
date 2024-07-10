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
} = require('../services');
const OffersServices = require('../services/offersServices');

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
    const {user} = await UsersServices.getUserById({
      id: req.jwtToken.user.id,
    });

    const {id} = req.params;

    const {offer} = await OffersServices.findOfferById({id});

    if (!offer) return next(OffersErrors.noOfferErr());

    const findConnectionQuery = {
      driverId: user.id,
      companyId: offer.companyId,
      isActive: true,
    };

    const {connection: findConnection} =
      await ConnectionsServices.findConnection({
        query: findConnectionQuery,
      });

    if (findConnection) return next(ConnectionErrors.alreadyConnectedErr());

    const {success, err} = await OffersServices.updateOfferStatus({
      id,
      status: statusTypes.accepted.value,
    });

    if (success) {
      await NotificationsServices.createNotification({
        userId: offer.companyId,
        relatedUserId: user.id,
        type: notificationTypes.accept_offer.value,
      });

      const {connection} = await ConnectionsServices.createConnection({
        companyId: offer.companyId,
        driverId: user.id,
      });

      return next(
        OfferResponsesFactory.offerAcceptedSuccessfully({connection})
      );
    }

    if (err) throw err;
  }

  static async rejectOffer(req, res, next) {
    const {user} = await UsersServices.getUserById({
      id: req.jwtToken.user.id,
    });

    const {id} = req.params;

    const {offer} = await OffersServices.findOfferById({id});

    if (!offer) return next(OffersErrors.noOfferErr());

    if (
      offer.status === statusTypes.rejected.value ||
      offer.status === statusTypes.accepted.value
    )
      return next(OffersErrors.requestResolvedErr());

    const {success, err} = await OffersServices.updateOfferStatus({
      id,
      status: statusTypes.rejected.value,
    });

    if (success) {
      await NotificationsServices.createNotification({
        userId: offer.companyId,
        relatedUserId: user.id,
        type: notificationTypes.reject_offer.value,
      });

      return next(OfferResponsesFactory.offerRejectedSuccessfully());
    }

    if (err) throw err;
  }
};
