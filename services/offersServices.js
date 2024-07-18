const {
  statusTypes,
  notificationTypes,
  driverStatuses,
} = require('../constants/usersConstants');
const {OffersModel, NotificationsModel, UsersModel} = require('../models');
const mongoose = require('mongoose');
const ConnectionsServices = require('./connectionsServices');
const GeneralServices = require('./generalServices');
const NotificationsServices = require('./notificationsServices');

module.exports = class OffersServices {
  static async acceptOffer({userId, offerId}) {
    const {doc: offer} = await GeneralServices.findById({
      id: offerId,
      model: OffersModel,
    });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await OffersModel.updateOne(
        {_id: offerId},
        {status: statusTypes.accepted.value},
        {session}
      );

      await NotificationsModel.create(
        [
          {
            userId: offer.companyId,
            relatedUserId: userId,
            type: notificationTypes.accept_offer.value,
          },
        ],
        {session}
      );

      const {newConnection} = await ConnectionsServices.createConnection({
        companyId: offer.companyId,
        driverId: userId,
        offerId: offerId,
        session,
      });

      await UsersModel.updateOne(
        {_id: userId},
        {driverStatus: driverStatuses.connected.value},
        {session}
      );

      await session.commitTransaction();
      session.endSession();

      //connection model contain companyId and driverId that's need to be populated for frontend logic to store connected connection
      const {connection} = await ConnectionsServices.findConnection({
        query: {_id: newConnection.id},
      });

      return {success: true, connection};
    } catch (err) {
      await session.abortTransaction();
      session.endSession();

      return {success: false, err};
    }
  }

  static async rejectOffer({userId, offerId}) {
    try {
      const {doc: offer} = await GeneralServices.findById({
        id: offerId,
        model: OffersModel,
      });

      const {doc: updatedOffer} = await GeneralServices.update({
        id: offerId,
        model: OffersModel,
        data: {status: statusTypes.rejected.value},
      });
      if (updatedOffer) {
        await NotificationsServices.createNotification({
          userId: offer.companyId,
          relatedUserId: userId,
          type: notificationTypes.reject_offer.value,
        });
      }
      return {success: true};
    } catch (error) {
      return {success: false, error};
    }
  }
};
