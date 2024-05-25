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
  static getJobByIdSuccessfully({job}) {
    return new AppResponse({
      message: 'Job retrieved successfully',
      statusCode: 200,
      body: {job},
    });
  }
  static jobUpdatedSuccessfully({job}) {
    return new AppResponse({
      message: 'Job updated successfully',
      statusCode: 200,
      body: {job},
    });
  }
  static jobDeletedSuccessfully() {
    return new AppResponse({
      message: 'Job deleted successfully',
      statusCode: 200,
      body: {},
    });
  }
};
