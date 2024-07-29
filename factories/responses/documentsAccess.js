const AppResponse = require('./AppResponse');

module.exports = class DocumentsAccessResponsesFactory {
  static documentsRequestSentSuccessfully({accessDocsRequest}) {
    return new AppResponse({
      message: 'You have successfully requested for this driver documents',
      statusCode: 201,
      body: {accessDocsRequest},
    });
  }
};
