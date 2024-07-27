const {ReviewsResponseFactory} = require('../factories');
const {ReviewsServices} = require('../services');

module.exports = class ReviewsController {
  static async getReviewsForAdmin(req, res, next) {
    let {page, limit, status, reviewType} = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const {success, error, reviews} = await ReviewsServices.getReviewsForAdmin({
      page,
      limit,
      status,
      reviewType,
    });

    if (success)
      return next(
        ReviewsResponseFactory.reviewRetrievedSuccessfully({
          count: reviews.totalCount,
          data: reviews.data,
          page,
          perPage: limit,
        })
      );

    if (error) throw error;
  }

  static async getUserRatings(req, res, next) {
    const userId = req.jwtToken.user.id;
    const role = req.jwtToken.user.role;

    const {success, error, ratings} = await ReviewsServices.getUserRatings({
      userId,
      role,
    });

    if (success)
      next(ReviewsResponseFactory.ratingsRetrievedSuccessfully({ratings}));

    if (error) throw error;
  }
};
