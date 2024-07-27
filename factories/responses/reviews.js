const AppResponse = require('./AppResponse');

module.exports = class ReviewsResponsesFactory {
  static reviewRetrievedSuccessfully({count, data, page, perPage}) {
    return new AppResponse({
      message: 'Review accepted successfully',
      statusCode: 200,
      body: {count, data, page, perPage},
    });
  }
};
