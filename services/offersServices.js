const {
  statusTypes,
  notificationTypes,
  driverStatuses,
  restrictedUserData,
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

  static async getOffersByJobId({page, limit, jobId}) {
    try {
      const skip = (page - 1) * limit;
      const [totalCount, data] = await Promise.all([
        OffersModel.countDocuments({jobId: jobId}),
        OffersModel.find({jobId: jobId}, null, {skip, limit})
          .populate({
            path: 'companyId',
            select: 'companyName profilePic contact',
          })
          .populate({
            path: 'driverId',
            select: restrictedUserData,
          }),
      ]);
      return {success: true, offers: {totalCount, data}};
    } catch (err) {
      return {success: false, err};
    }
  }

  static async getOffersByDriverId({page, limit, driverId}) {
    try {
      const skip = (page - 1) * limit;
      const query = {
        $and: [{driverId: driverId}, {status: statusTypes.pending.value}],
      };
      const [totalCount, data] = await Promise.all([
        OffersModel.countDocuments(query),
        OffersModel.find(query, null, {skip, limit})
          .populate({
            path: 'companyId',
            select: 'companyName profilePic contact',
          })
          .populate({
            path: 'jobId',
          }),
      ]);
      return {success: true, offers: {totalCount, data}};
    } catch (err) {
      return {success: false, err};
    }
  }
};
