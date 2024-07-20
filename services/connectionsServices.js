const {
  reviewTypes,
  driverStatuses,
  notificationTypes,
  statusTypes,
} = require('../constants/usersConstants');
const {
  ConnectionsModel,
  ReviewsModel,
  UsersModel,
  NotificationsModel,
} = require('../models');
const {
  getCurrentDate,
  dateAfterSevenDays,
} = require('../utils/DateCalculations');
const mongoose = require('mongoose');

module.exports = class ConnectionsServices {
  static async findConnection({query}) {
    try {
      const connection = await ConnectionsModel.findOne(query).populate({
        path: 'driverId companyId',
        select: 'firstName lastName companyName profilePic',
      });
      return {success: true, connection};
    } catch (err) {
      return {success: false, err};
    }
  }

  static async createConnection({driverId, companyId, offerId, session}) {
    try {
      const newConnection = await ConnectionsModel.create(
        [{driverId, companyId, offerId, startDate: getCurrentDate()}],
        {session}
      );
      return {success: true, newConnection: newConnection[0]};
    } catch (err) {
      return {success: false, err};
    }
  }

  static async UpdateConnectionWithSession({
    companyId,
    driverId,
    reviewId,
    reviewType,
    connection,
    session,
  }) {
    try {
      let updateConnectionData;

      // check if company Review id is not present then simply add end date , review end date and driver reviewId
      // otherwise if company review id is present then make connection in-active and add driver review id
      if (reviewType === reviewTypes.driver_review.value) {
        if (!connection.companyReviewId) {
          updateConnectionData = {
            endDate: new Date(),
            driverReviewId: reviewId,
            reviewEndDate: dateAfterSevenDays(),
          };
        } else {
          updateConnectionData = {
            isActive: false,
            driverReviewId: reviewId,
          };
        }
      }

      await ConnectionsModel.updateOne(
        {
          $and: [{driverId: driverId}, {companyId: companyId}],
        },
        updateConnectionData,
        {session}
      );
      return {success: true};
    } catch (error) {
      return {success: false, err};
    }
  }

  static async disconnectionByDriver({data, userId, connection}) {
    try {
      let finalData = {
        ...data,
        personalRelations: parseFloat(data.personalRelations),
        trucks: parseFloat(data.trucks),
      };

      const session = await mongoose.startSession();
      session.startTransaction();

      let averageRating = (finalData.personalRelations + finalData.trucks) / 2;

      finalData.averageRating = averageRating;

      finalData.status =
        averageRating < 2
          ? statusTypes.pending.value
          : statusTypes.accepted.value;

      // create review when driver disconnect from company
      const newReview = await ReviewsModel.create([finalData], {session});

      if (newReview.length > 0) {
        // update connection on the base of driver review
        await ConnectionsServices.UpdateConnectionWithSession({
          companyId: finalData.companyId,
          driverId: userId,
          reviewId: newReview[0].id,
          reviewType: reviewTypes.driver_review.value,
          connection,
          session,
        });

        let updateDriverStatusData = {};

        // if companyReviewId is already present then make driver to available otherwise make it to available soon
        if (connection.companyReviewId) {
          updateDriverStatusData = {
            driverStatus: driverStatuses.available.value,
          };
        } else {
          updateDriverStatusData = {
            driverStatus: driverStatuses.availableSoon.value,
          };
        }

        await UsersModel.updateOne(
          {
            _id: userId,
          },
          updateDriverStatusData,
          {session}
        );

        await NotificationsModel.create(
          [
            {
              userId: finalData.companyId,
              relatedUserId: userId,
              type: notificationTypes.driver_disconnect.value,
            },
          ],
          {session}
        );

        await session.commitTransaction();
        session.endSession();

        return {success: true};
      } else {
        return {success: false};
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      return {success: false, error};
    }
  }
};
