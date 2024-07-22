const AppResponse = require('./AppResponse');

module.exports = class ConnectionResponsesFactory {
  static disconnectSuccessfully() {
    return new AppResponse({
      message: 'You have disconnected successfully',
      statusCode: 200,
      body: {},
    });
  }
  static connectionRetrievedSuccessfully({connection}) {
    return new AppResponse({
      message: 'Connection retrieved successfully',
      statusCode: 200,
      body: {connection},
    });
  }
};
