const {
  statusTypes,
  driverStatuses,
  reviewTypes,
} = require('../constants/usersConstants');
const {ReviewsResponseFactory, ReviewsErrors} = require('../factories');
const {ReviewsModel, ConnectionsModel, UsersModel} = require('../models');
const {ReviewsServices, GeneralServices} = require('../services');

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
        ReviewsResponseFactory.reviewsForAdminRetrievedSuccessfully({
          count: reviews.totalCount,
          data: reviews.data,
          page,
          perPage: limit,
        })
      );

    if (error) throw error;
  }

  static async getUserRatingsByUserId(req, res, next) {
    const {userId} = req.params;
    const {role} = req.query;

    const {success, error, ratings} =
      await ReviewsServices.getUserRatingsByUserId({
        userId,
        role,
      });

    if (success)
      next(ReviewsResponseFactory.ratingsRetrievedSuccessfully({ratings}));

    if (error) throw error;
  }

  static async updateReviewStatus(req, res, next) {
    const {id: reviewId} = req.params;
    const {status} = req.body;

    const {doc: review} = await GeneralServices.findById({
      id: reviewId,
      model: ReviewsModel,
    });

    if (
      review.status === statusTypes.accepted.value ||
      review.status === statusTypes.rejected.value
    )
      return next(ReviewsErrors.alreadyReviewUpdateErr());

    const {success, error} = await ReviewsServices.updateReviewStatus({
      status,
      review,
    });

    if (success) {
      if (review.type === reviewTypes.driver_review.value) {
        const connection = await ConnectionsModel.findOne({
          _id: review.connectionId,
        }).populate({path: 'driverId', select: 'driverStatus'});

        const isDriverNotConnected =
          connection.driverId.driverStatus !== driverStatuses.connected.value;

        if (isDriverNotConnected) {
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
      }

      return next(ReviewsResponseFactory.statusUpdatedSuccessfully());
    }

    if (error) throw error;
  }

  static async getDriverReviewsForCompany(req, res, next) {
    const userId = req.jwtToken.user.id;

    const {success, error, reviews} =
      await ReviewsServices.getDriverReviewsForCompany({userId});

    if (success)
      return next(
        ReviewsResponseFactory.reviewRetrievedSuccessfully({
          reviews,
        })
      );

    if (error) throw error;
  }
};
