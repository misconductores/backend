const {
  roles,
  reviewTypes,
  statusTypes,
} = require('../constants/usersConstants');
const {ReviewsModel} = require('../models');
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

  static async updateReviewStatus({reviewId, status}) {
    try {
      const {doc: updatedReview} = await GeneralServices.update({
        id: reviewId,
        model: ReviewsModel,
        data: {status: status},
      });
      return {success: true, updatedReview};
    } catch (error) {
      return {success: false, error};
    }
  }

  static async getDriverReviewsForCompany({userId, page, limit}) {
    try {
      const skip = (page - 1) * limit;

      const query = {
        companyId: userId,
        type: reviewTypes.company_review.value,
        status: statusTypes.accepted.value,
      };

      const [totalCount, data] = await Promise.all([
        ReviewsModel.countDocuments(query),
        ReviewsModel.find(query, null, {skip, limit}).populate({
          path: 'driverId',
          select: 'firstName lastName profilePic',
        }),
      ]);

      return {success: true, result: {totalCount, data}};
    } catch (error) {
      return {success: false, error};
    }
  }
};
