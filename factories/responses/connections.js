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
  static companyDriversRetrievedSuccessfully({count, data, page, perPage}) {
    return new AppResponse({
      message: 'Drivers retrieved successfully',
      statusCode: 200,
      body: {count, data, page, perPage},
    });
  }
  static jobHistoryRetrievedSuccessfully({history}) {
    return new AppResponse({
      message: 'Job history retrieved successfully',
      statusCode: 200,
      body: {history},
    });
  }
};
