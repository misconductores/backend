const AppResponse = require('./AppResponse');

module.exports = class ReviewsResponsesFactory {
  static reviewAcceptedSuccessfully({data} = {}) {
    return new AppResponse({
      message: 'Review accepted successfully',
      statusCode: 200,
      body: {data},
    });
  }
};
