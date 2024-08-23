const {
  roles,
  reviewTypes,
  statusTypes,
  driverStatuses,
  connectionStatuses,
} = require('../constants/usersConstants');
const {ReviewsModel, UsersModel, ConnectionsModel} = require('../models');
const GeneralServices = require('./generalServices');

module.exports = class ReviewsServices {
  static async getReviewsForAdmin({page, limit, status, reviewType}) {
    try {
      const skip = (page - 1) * limit;
      const query = {status, type: reviewType, averageRating: {$lt: '2'}};
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
      if (review.type === reviewTypes.driver_review.value) {
        const {doc: connection} = await GeneralServices.findOne({
          query: {_id: review.connectionId},
          model: ConnectionsModel,
        });

        await GeneralServices.update({
          id: review.driverId,
          data: {
            driverStatus: connection.companyReviewId
              ? driverStatuses.available.value
              : driverStatuses.availableSoon.value,
          },
          model: UsersModel,
        });
      }
      return {success: true};
    } catch (error) {
      return {success: false, error};
    }
  }

  static async getDriverReviewsForCompany({userId}) {
    try {
      let connections = await ConnectionsModel.find({
        companyId: userId,
        status: connectionStatuses.inactive.value,
      })
        .populate({
          path: 'driverId',
          select: 'firstName lastName profilePic',
        })
        .populate('companyReviewId driverReviewId');

      // it will returns the reviews for company when both driver and company
      // reviews are accepted otherwise returns empty array
      const reviews = connections.filter((item) => {
        let newObj = item.toObject();
        const isCompanyReviewAccepted =
          newObj.companyReviewId.status === statusTypes.accepted.value;
        const isDriverReviewAccepted =
          newObj.driverReviewId.status === statusTypes.accepted.value;
        if (isCompanyReviewAccepted && isDriverReviewAccepted) {
          return {
            driver: newObj.driverId,
            ...newObj.companyReviewId,
          };
        }
      });

      return {success: true, reviews};
    } catch (error) {
      return {success: false, error};
    }
  }
};
