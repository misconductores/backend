const {errorCodes} = require('../../constants/usersConstants');
const AppError = require('./AppError');

module.exports = class ReviewsErrorsFactory {
  static alreadyReviewExistErr() {
    return new AppError({
      message: 'You have already given the review',
      statusCode: 400,
    });
  }
  static alreadyReviewUpdateErr() {
    return new AppError({
      message: 'You have already update the review',
      statusCode: 400,
    });
  }
  static forbiddenReviewsErr() {
    return new AppError({
      message: 'You are not allowed to view driver job history in free mode',
      statusCode: 403,
      err: {
        type: errorCodes.JOB_HISTORY_NOT_ALLOWED,
      },
    });
  }
};
