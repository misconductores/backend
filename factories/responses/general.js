const AppResponse = require('./AppResponse');

module.exports = class GeneralResponsesFactory {
  static successResponse({message, statusCode, data, key}) {
    return new AppResponse({
      message: message,
      statusCode: statusCode,
      body: {[key]: data},
    });
  }

  static dataSavedSuccessfully({data, key}) {
    return this.successResponse({
      message: 'Data saved successfully',
      statusCode: 201,
      data,
      key,
    });
  }

  static dataRetrievedSuccessfully({data, key}) {
    return this.successResponse({
      message: 'Data retrieved successfully',
      statusCode: 200,
      data,
      key,
    });
  }

  static dataUpdatedSuccessfully({data, key}) {
    return this.successResponse({
      message: 'Data updated successfully',
      statusCode: 200,
      data,
      key,
    });
  }

  static dataDeletedSuccessfully({data, key}) {
    return this.successResponse({
      message: 'Data deleted successfully',
      statusCode: 200,
      data,
      key,
    });
  }
};
