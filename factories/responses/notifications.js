const AppResponse = require('./AppResponse');

module.exports = class NotificationsResponsesFactory {
  static notificationsRetrievedSuccessfully({count, data, page, perPage}) {
    return new AppResponse({
      message: 'Notifications retrieved successfully',
      statusCode: 200,
      body: {count, data, page, perPage},
    });
  }
};
