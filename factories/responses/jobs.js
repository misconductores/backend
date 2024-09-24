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

  static applyForJobSuccessfully() {
    return new AppResponse({
      message: 'You have been successfully applied for this job',
      statusCode: 200,
      body: {},
    });
  }

  static applicantsRetrievedSuccessfully({count, data, page, perPage}) {
    return new AppResponse({
      message: 'Applicants retrieved successfully',
      statusCode: 200,
      body: {count, data, page, perPage},
    });
  }
  static appliedJobsRetrievedSuccessfully({appliedJobs}) {
    return new AppResponse({
      message: 'Applied jobs retrieved successfully',
      statusCode: 200,
      body: {appliedJobs},
    });
  }
};
