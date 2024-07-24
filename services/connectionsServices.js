const {
  reviewTypes,
  driverStatuses,
  notificationTypes,
  statusTypes,
  restrictedUserData,
  connectionStatuses,
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
const GeneralServices = require('./generalServices');

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
        [
          {
            driverId,
            companyId,
            offerId,
            status: connectionStatuses.active.value,
            startDate: getCurrentDate(),
          },
        ],
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

      // check if company Review id is not present then simply add end date , review end date and driver reviewId, make the connection pending until company reviewed it back
      // otherwise if company review id is present then make connection in-active and add driver review id, make the connection pending until driver reviewed it back
      if (reviewType === reviewTypes.driver_review.value) {
        if (!connection.companyReviewId) {
          updateConnectionData = {
            endDate: new Date(),
            driverReviewId: reviewId,
            reviewEndDate: dateAfterSevenDays(),
            status: connectionStatuses.pending.value,
          };
        } else {
          updateConnectionData = {
            status: connectionStatuses.inactive.value,
            driverReviewId: reviewId,
          };
        }
      } else if (reviewType === reviewTypes.company_review.value) {
        if (!connection.driverReviewId) {
          updateConnectionData = {
            endDate: new Date(),
            companyReviewId: reviewId,
            reviewEndDate: dateAfterSevenDays(),
            status: connectionStatuses.pending.value,
          };
        } else {
          updateConnectionData = {
            status: connectionStatuses.inactive.value,
            companyReviewId: reviewId,
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
      return {success: false, error};
    }
  }

  static async disconnectionByDriver({data, userId}) {
    const session = await mongoose.startSession();

    try {
      let connectionQuery = {
        driverId: userId,
        status: connectionStatuses.active.value,
      };

      const {doc: connection} = await GeneralServices.findOne({
        query: connectionQuery,
        model: ConnectionsModel,
      });

      let finalData = {
        ...data,
        personalRelations: parseFloat(data.personalRelations),
        trucks: parseFloat(data.trucks),
      };

      session.startTransaction();

      let averageRating = (finalData.personalRelations + finalData.trucks) / 2;

      finalData.averageRating = averageRating;

      // if average rating is less than 2 then review will be pending for admin otherwise accepted
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
        await session.abortTransaction();
        session.endSession();
        return {success: false};
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      return {success: false, error};
    }
  }

  static async disconnectionByCompany({data, userId}) {
    const session = await mongoose.startSession();

    try {
      let connectionQuery = {
        driverId: data.driverId,
        companyId: userId,
        status: connectionStatuses.active.value,
      };

      const {doc: connection} = await GeneralServices.findOne({
        query: connectionQuery,
        model: ConnectionsModel,
      });

      let finalData = {
        ...data,
        careUnit: parseFloat(data.careUnit),
        cleaningUnit: parseFloat(data.cleaningUnit),
        punctualityUnit: parseFloat(data.punctualityUnit),
        performance: parseFloat(data.performance),
      };

      session.startTransaction();

      let averageRating =
        (finalData.careUnit +
          finalData.cleaningUnit +
          finalData.punctualityUnit +
          finalData.performance) /
        4;

      finalData.averageRating = averageRating;

      // if average rating is less than 2 then review will be pending for admin otherwise accepted
      finalData.status =
        averageRating < 2
          ? statusTypes.pending.value
          : statusTypes.accepted.value;

      // create review when company disconnect from driver
      const newReview = await ReviewsModel.create([finalData], {session});

      if (newReview.length > 0) {
        // update connection on the base of company review
        await ConnectionsServices.UpdateConnectionWithSession({
          companyId: userId,
          driverId: finalData.driverId,
          reviewId: newReview[0].id,
          reviewType: reviewTypes.company_review.value,
          connection,
          session,
        });

        let updateDriverStatusData = {};

        // if driverReviewId is already present then make driver to available otherwise make it to available soon
        if (connection.driverReviewId) {
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
            _id: finalData.driverId,
          },
          updateDriverStatusData,
          {session}
        );

        await NotificationsModel.create(
          [
            {
              userId: finalData.companyId,
              relatedUserId: userId,
              type: notificationTypes.company_disconnect.value,
            },
          ],
          {session}
        );

        await session.commitTransaction();
        session.endSession();

        return {success: true};
      } else {
        await session.abortTransaction();
        session.endSession();
        return {success: false};
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      return {success: false, error};
    }
  }

  static async getConnectedCompany({userId}) {
    try {
      const connection = await ConnectionsModel.findOne({
        driverId: userId,
        status: {$ne: connectionStatuses.inactive.value},
      }).populate({
        path: 'companyId',
        select: 'contact profilePic companyName',
      });

      if (connection) {
        return {success: true, connection};
      } else {
        return {success: false};
      }
    } catch (error) {
      return {success: false, error};
    }
  }

  static async getCompanyDrivers({page, limit, userId, status}) {
    try {
      const skip = (page - 1) * limit;
      const query = {companyId: userId, status: status};
      const [totalCount, data] = await Promise.all([
        ConnectionsModel.countDocuments(query),
        ConnectionsModel.find(query, null, {skip, limit}).populate({
          path: 'driverId',
          select: restrictedUserData,
        }),
      ]);
      return {success: true, drivers: {totalCount, data}};
    } catch (error) {
      return {success: false, error};
    }
  }

  static async getDriverJobHistory({userId}) {
    try {
      const history = await ConnectionsModel.find({
        driverId: userId,
        status: connectionStatuses.inactive.value,
      })
        .populate({
          path: 'companyId',
          select: 'companyName contact profilePic',
        })
        .populate('companyReviewId');

      return {success: true, history};
    } catch (error) {
      return {success: false, error};
    }
  }
};
