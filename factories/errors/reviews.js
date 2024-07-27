const AppError = require('./AppError');

module.exports = class ReviewsErrorsFactory {
  static alreadyReviewExistErr() {
    return new AppError({
      message: 'You have already given the review',
      statusCode: 400,
    });
  }
};
