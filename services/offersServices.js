const {
  statusTypes,
  notificationTypes,
  driverStatuses,
} = require('../constants/usersConstants');
const {OffersModel, NotificationsModel, UsersModel} = require('../models');
const mongoose = require('mongoose');
const ConnectionsServices = require('./connectionsServices');

module.exports = class OffersServices {
  static async acceptOffer({userId, offer}) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await OffersModel.updateOne(
        {_id: offer.id},
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
        offerId: offer.id,
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
};
