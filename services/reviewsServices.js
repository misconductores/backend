const {ReviewsModel} = require('../models');

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
};
