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
const {getCurrentDate} = require('../utils/DateCalculations');
const mongoose = require('mongoose');
const GeneralServices = require('./generalServices');
const {generateConnectionQuery} = require('../utils/helpers/connections');
const {DateTime} = require('luxon');

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

  static async UpdateConnection({reviewId, reviewType, connection, session}) {
    try {
      const updateConnectionData = generateConnectionQuery({
        connection,
        reviewId,
        reviewType,
      });

      await ConnectionsModel.updateOne(
        {
          _id: connection.id,
        },
        updateConnectionData,
        {session}
      );

      return {success: true};
    } catch (error) {
      return {success: false, error};
    }
  }

  static async disconnectByDriver({data, userId}) {
    const session = await mongoose.startSession();

    try {
      let connectionQuery = {
        driverId: userId,
        status: {
          $in: [
            connectionStatuses.active.value,
            connectionStatuses.pending.value,
          ],
        },
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

      // if average rating is less than or equal to 2 then review will be pending for admin otherwise accepted
      finalData.status =
        averageRating <= 2
          ? statusTypes.pending.value
          : statusTypes.accepted.value;

      // create review when driver disconnect from company
      const newReview = await ReviewsModel.create([finalData], {session});

      if (newReview.length > 0) {
        // update connection on the base of driver review
        await ConnectionsServices.UpdateConnection({
          reviewId: newReview[0].id,
          reviewType: reviewTypes.company_review.value,
          connection,
          session,
        });

        let updateDriverStatusData = {};

        const {doc: user} = await GeneralServices.findById({
          id: userId,
          model: UsersModel,
        });

        if (user.driverStatus !== driverStatuses.waitingDecision.value) {
          // if driverReviewId (company has already disconnect the driver) is already present then make driver to available otherwise make it to available soon
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
              _id: userId,
            },
            updateDriverStatusData,
            {session}
          );
        }

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

  static async disconnectByCompany({data, userId, isIncidentThreeTimesRow}) {
    const session = await mongoose.startSession();

    try {
      let connectionQuery = {
        driverId: data.driverId,
        companyId: userId,
        status: {
          $in: [
            connectionStatuses.active.value,
            connectionStatuses.pending.value,
          ],
        },
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

      // if incident three times are row for particular driver then make the review pending whether greater than 2 or less than 2
      // if average rating is less than or equal to 2 then review will be pending for admin otherwise accepted
      if (isIncidentThreeTimesRow) {
        finalData.status = statusTypes.pending.value;
        finalData.isThirdIncidentInARow = true;
      } else {
        finalData.status =
          averageRating <= 2
            ? statusTypes.pending.value
            : statusTypes.accepted.value;
      }

      // create review when company disconnect from driver
      const newReview = await ReviewsModel.create([finalData], {session});

      if (newReview.length > 0) {
        // update connection on the base of company review
        await ConnectionsServices.UpdateConnection({
          reviewId: newReview[0].id,
          reviewType: reviewTypes.driver_review.value,
          connection,
          session,
        });

        let updateDriverStatusData = {};

        // if company review driver for 3rd time in a row with incident reason then driver will be underInspection
        //if driverReviewId is already present then make driver to available otherwise make it to available soon
        if (isIncidentThreeTimesRow) {
          updateDriverStatusData = {
            driverStatus: driverStatuses.waitingDecision.value,
          };
        } else if (averageRating > 2) {
          updateDriverStatusData = {
            driverStatus: connection.companyReviewId
              ? driverStatuses.available.value
              : driverStatuses.availableSoon.value,
          };
        } else {
          updateDriverStatusData = {
            driverStatus: driverStatuses.waitingDecision.value,
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
              userId: finalData.driverId,
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
        status: {
          $in: [
            connectionStatuses.pending.value,
            connectionStatuses.active.value,
          ],
        },
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
      const currentDate = getCurrentDate();

      let connections = await ConnectionsModel.find({
        driverId: userId,
        status: connectionStatuses.inactive.value,
      })
        .populate({
          path: 'companyId',
          select: 'companyName contact profilePic',
        })
        .populate('driverReviewId companyReviewId');

      const history = connections.map((item) => {
        let connection = item.toObject();

        const isCompanyReviewAccepted =
          connection?.companyReviewId?.status === statusTypes.accepted.value;
        const isDriverReviewAccepted =
          connection?.driverReviewId?.status === statusTypes.accepted.value;

        const isReviewEndDateNotReached =
          currentDate < DateTime.fromJSDate(connection.reviewEndDate);

        const oneReviewNotAccepted =
          !isDriverReviewAccepted || !isCompanyReviewAccepted;

        if (!isDriverReviewAccepted) connection.driverReviewId = null;

        // when one is pending and we are still in the 7 days, company review for driver (driver review) should be hidden
        if (oneReviewNotAccepted && isReviewEndDateNotReached)
          connection.driverReviewId = null;

        // driver review for company  (company review) always remain hidden
        connection.companyReviewId = null;
        return connection;
      });

      return {success: true, history};
    } catch (error) {
      return {success: false, error};
    }
  }
};
