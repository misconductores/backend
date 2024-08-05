const AppResponse = require('./AppResponse');

module.exports = class DocumentsAccessResponsesFactory {
  static requestedDocumentsSuccessfully() {
    return new AppResponse({
      message: 'You have successfully requested for this driver documents',
      statusCode: 201,
      body: {},
    });
  }
  static documentRequestsRetrievedSuccessfully({count, data, page, perPage}) {
    return new AppResponse({
      message: 'Documents access requests retrieved successfully',
      statusCode: 200,
      body: {count, data, page, perPage},
    });
  }
  static documentsRetrievedSuccessfully({documents}) {
    return new AppResponse({
      message: 'Documents retrieved successfully',
      statusCode: 200,
      body: {documents},
    });
  }
  static documentsAccessReqStatusUpdatedSuccessfully() {
    return new AppResponse({
      message: 'You have updated the status successfully',
      statusCode: 200,
      body: {},
    });
  }
};
