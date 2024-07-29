const AppResponse = require('./AppResponse');

module.exports = class OfferResponsesFactory {
  static documentsRequestSentSuccessfully() {
    return new AppResponse({
      message: 'You have successfully requested for this driver documents',
      statusCode: 201,
      body: {},
    });
  }
};
