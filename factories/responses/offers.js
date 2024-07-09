const AppResponse = require('./AppResponse');

module.exports = class OfferResponsesFactory {
  static offerSendSuccessfully({offer}) {
    return new AppResponse({
      message: 'Offer sent successfully',
      statusCode: 201,
      body: {offer},
    });
  }
  static offerAcceptedSuccessfully({connection}) {
    return new AppResponse({
      message: 'Offer accepted successfully & connected to a company',
      statusCode: 201,
      body: {connection},
    });
  }
  static offerRejectedSuccessfully() {
    return new AppResponse({
      message: 'Offer Rejected successfully',
      statusCode: 201,
      body: {},
    });
  }
};
