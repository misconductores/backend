const AppResponse = require('./AppResponse');

module.exports = class DocumentsAccessResponsesFactory {
  static requestedDocumentsSuccessfully() {
    return new AppResponse({
      message: 'You have successfully requested for this driver documents',
      statusCode: 201,
      body: {},
    });
  }
};
