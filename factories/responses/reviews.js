const AppResponse = require('./AppResponse');

module.exports = class ReviewsResponsesFactory {
  static reviewRetrievedSuccessfully({reviews}) {
    return new AppResponse({
      message: 'Review retrieved successfully',
      statusCode: 200,
      body: {reviews},
    });
  }
  static ratingsRetrievedSuccessfully({ratings}) {
    return new AppResponse({
      message: 'Ratings retrieved successfully',
      statusCode: 200,
      body: {ratings},
    });
  }
  static statusUpdatedSuccessfully() {
    return new AppResponse({
      message: 'Status updated successfully',
      statusCode: 200,
      body: {},
    });
  }
};
