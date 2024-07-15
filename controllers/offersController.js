const {notificationTypes} = require('../constants/usersConstants');
const {
  ConnectionErrors,
  OffersErrors,
  OffersResponsesFactory,
} = require('../factories');
const {OffersModel, ConnectionsModel} = require('../models');
const {NotificationsServices, GeneralServices} = require('../services');

module.exports = class OffersController {
  static async sendOffer(req, res, next) {
    const userId = req.jwtToken.user.id;

    const {driverId, jobId} = req.body;

    const findConnectionQuery = {
      driverId: driverId,
      companyId: userId,
      isActive: true,
    };

    const {doc: connection} = await GeneralServices.findOne({
      query: findConnectionQuery,
      model: ConnectionsModel,
    });

    if (connection) return next(ConnectionErrors.alreadyConnectedErr());

    const {doc: findOffer} = await GeneralServices.findOne({
      query: {
        jobId: jobId,
        driverId: driverId,
        companyId: userId,
      },
      model: OffersModel,
    });

    if (findOffer) return next(OffersErrors.alreadySendOfferErr());

    const {
      success: response,
      error,
      doc: offer,
    } = await GeneralServices.create({
      data: {companyId: userId, driverId, jobId},
      model: OffersModel,
    });

    if (response) {
      await NotificationsServices.createNotification({
        userId: userId,
        relatedUserId: driverId,
        type: notificationTypes.send_offer.value,
      });

      return next(OffersResponsesFactory.offerSendSuccessfully({offer}));
    }

    if (error) throw error;
  }
};
