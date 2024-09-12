const AppResponse = require('./AppResponse');

module.exports = class OthersResponsesFactory {
  static cityListResponse({data} = {}) {
    return new AppResponse({
      message: 'City list retrieved successfully',
      statusCode: 200,
      body: {data},
    });
  }
  static countersRetrieveSuccessfully({counters}) {
    return new AppResponse({
      message: 'Counters retrieved successfully',
      statusCode: 200,
      body: {counters},
    });
  }
};
