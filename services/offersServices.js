const {
  statusTypes,
  notificationTypes,
  driverStatuses,
} = require('../constants/usersConstants');
const {
  OffersModel,
  NotificationsModel,
  UsersModel,
  ApplicantsModel,
} = require('../models');
const mongoose = require('mongoose');
const ConnectionsServices = require('./connectionsServices');
const GeneralServices = require('./generalServices');
const NotificationsServices = require('./notificationsServices');
const {
  getMatchOffersPipeline,
  getWithoutMatchOffersPipeline,
  getMatchOffersCountPipeline,
} = require('../utils/pipelines/offers');
const {getWithoutMatchCountPipeline} = require('../utils/pipelines/common');

module.exports = class OffersServices {
  static async sendOffer({
    userId,
    driverId,
    jobId,
    isOfferSendToApplicant = null,
  }) {
    try {
      const {success: response, doc: offer} = await GeneralServices.create({
        data: {companyId: userId, driverId, jobId},
        model: OffersModel,
      });

      if (response) {
        // if offer was sent to applicant then update the applicant collection
        if (isOfferSendToApplicant)
          await ApplicantsModel.updateOne(
            {$and: [{jobId: jobId}, {driverId: driverId}]},
            {isOfferSent: true}
          );

        await NotificationsServices.createNotification({
          userId: driverId,
          relatedUserId: userId,
          type: notificationTypes.send_offer.value,
        });

        return {success: true, offer};
      }
    } catch (error) {
      return {success: false, error};
    }
  }

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

  static async getOffersByJobId({page, limit, jobId, searchTerm}) {
    try {
      const skip = (page - 1) * limit;

      // Choose pipelines based on the presence of searchTerm
      const pipeline = searchTerm
        ? getMatchOffersPipeline({limit, skip, jobId, searchTerm})
        : getWithoutMatchOffersPipeline({limit, skip, jobId});

      const countPipeline = searchTerm
        ? getMatchOffersCountPipeline({jobId, searchTerm})
        : getWithoutMatchCountPipeline({jobId});

      const [data, totalCountResult] = await Promise.all([
        OffersModel.aggregate(pipeline),
        OffersModel.aggregate(countPipeline),
      ]);

      const totalCount = totalCountResult[0]?.count || 0;

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

  static async withdrawOfferById({offerId}) {
    try {
      await GeneralServices.update({
        id: offerId,
        model: OffersModel,
        data: {status: statusTypes.withdrawn.value},
      });
      return {success: true};
    } catch (error) {
      return {success: false, error};
    }
  }
};
