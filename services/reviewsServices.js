const {DateTime} = require('luxon');
const {
  roles,
  reviewTypes,
  statusTypes,
  connectionStatuses,
} = require('../constants/usersConstants');
const {ReviewsModel, ConnectionsModel} = require('../models');
const {getCurrentDate} = require('../utils/DateCalculations');
const GeneralServices = require('./generalServices');

module.exports = class ReviewsServices {
  static async getReviewsForAdmin({page, limit, status, reviewType}) {
    try {
      const skip = (page - 1) * limit;
      const query = {
        status,
        type: reviewType,
        $or: [{averageRating: {$lte: '2'}}, {isThirdIncidentInARow: true}],
      };
      const [totalCount, data] = await Promise.all([
        ReviewsModel.countDocuments(query),
        ReviewsModel.find(query, null, {skip, limit})
          .populate({
            path: 'companyId',
            select: 'companyName profilePic',
          })
          .populate({
            path: 'driverId',
            select: 'firstName lastName profilePic',
          }),
      ]);
      return {success: true, reviews: {totalCount, data}};
    } catch (error) {
      return {success: false, error};
    }
  }

  static async getUserRatingsByUserId({userId, role}) {
    try {
      let query = {
        status: statusTypes.accepted.value,
      };
      if (role === roles.driver.value) {
        query = {
          ...query,
          driverId: userId,
          type: reviewTypes.driver_review.value,
        };
      } else {
        query = {
          ...query,
          companyId: userId,
          type: reviewTypes.company_review.value,
        };
      }
      const reviews = await ReviewsModel.find(query);

      let finalRatings = 0;

      if (reviews.length > 0) {
        const sumOfAverageRating = reviews.reduce(
          (sum, review) => sum + parseFloat(review.averageRating),
          0
        );

        finalRatings = sumOfAverageRating / reviews.length;
      }
      return {success: true, ratings: finalRatings};
    } catch (error) {
      return {success: false, error};
    }
  }

  static async updateReviewStatus({status, review}) {
    try {
      await GeneralServices.update({
        id: review.id,
        model: ReviewsModel,
        data: {status: status},
      });

      return {success: true};
    } catch (error) {
      return {success: false, error};
    }
  }

  static async getDriverReviewsForCompany({userId}) {
    try {
      const currentDate = getCurrentDate();

      let connections = await ConnectionsModel.find({
        companyId: userId,
        status: connectionStatuses.inactive.value,
      })
        .populate({
          path: 'driverId',
          select: 'firstName lastName profilePic',
        })
        .populate('companyReviewId driverReviewId');

      const reviews = connections.filter((item) => {
        let connection = item.toObject();

        const isCompanyReviewAccepted =
          connection?.companyReviewId?.status === statusTypes.accepted.value;
        const isDriverReviewAccepted =
          connection?.driverReviewId?.status === statusTypes.accepted.value;

        const bothReviewAccepted =
          isCompanyReviewAccepted && isDriverReviewAccepted;

        const isReviewEndDateReached =
          currentDate >= DateTime.fromJSDate(connection.reviewEndDate);

        // if both review accepted or end date has been reached with accepted company review then return company reviews
        if (
          bothReviewAccepted ||
          (isReviewEndDateReached && isCompanyReviewAccepted)
        ) {
          return {
            driver: connection.driverId,
            ...connection.companyReviewId,
          };
        }
      });
      return {success: true, reviews};
    } catch (error) {
      return {success: false, error};
    }
  }
};
