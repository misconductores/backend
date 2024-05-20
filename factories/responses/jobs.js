const AppResponse = require('./AppResponse');

module.exports = class JobResponsesFactory {
  static jobCreatedSuccessfully({job}) {
    return new AppResponse({
      message: 'Job created successfully',
      statusCode: 201,
      body: {job},
    });
  }
};
