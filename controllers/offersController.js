const {roles, notificationTypes} = require('../constants/usersConstants');
const {
  UsersErrorsFactory,
  ConnectionErrors,
  OffersErrors,
  OffersResponsesFactory,
} = require('../factories');
const {OffersModel} = require('../models');
const {
  UsersServices,
  ConnectionsServices,
  NotificationsServices,
  GeneralServices,
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
        userId: user.id,
        relatedUserId: driverId,
        type: notificationTypes.send_offer.value,
      });

      return next(OffersResponsesFactory.offerSendSuccessfully({offer}));
    }

    if (error) throw error;
  }
};
