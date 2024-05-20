const AppResponse = require('./AppResponse');

module.exports = class JobResponsesFactory {
  static jobCreatedSuccessfully({job}) {
    return new AppResponse({
      message: 'Job created successfully',
      statusCode: 201,
      body: {job},
    });
  }
  static jobRetrievedSuccessfully({count, data, page, perPage}) {
    return new AppResponse({
      message: 'Job list retrieved successfully',
      statusCode: 200,
      body: {count, data, page, perPage},
    });
  }
};
