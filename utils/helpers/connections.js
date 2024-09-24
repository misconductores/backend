const {
  reviewTypes,
  connectionStatuses,
} = require('../../constants/usersConstants');
const {dateAfterSevenDays} = require('../DateCalculations');

exports.generateConnectionQuery = ({connection, reviewType, reviewId}) => {
  let body;

  const isDriverReview = reviewType === reviewTypes.driver_review.value;
  const checkReviewId = isDriverReview
    ? connection.companyReviewId
    : connection.driverReviewId;
  const reviewIdKey = isDriverReview ? 'driverReviewId' : 'companyReviewId';

  if (!checkReviewId) {
    body = {
      endDate: new Date(),
      [reviewIdKey]: reviewId,
      reviewEndDate: dateAfterSevenDays(),
      status: connectionStatuses.pending.value,
    };
  } else {
    body = {
      status: connectionStatuses.inactive.value,
      [reviewIdKey]: reviewId,
    };
  }

  return body;
};
