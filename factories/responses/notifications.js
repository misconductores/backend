const AppResponse = require('./AppResponse');

module.exports = class NotificationsResponsesFactory {
  static notificationsRetrievedSuccessfully({count, data, page, perPage}) {
    return new AppResponse({
      message: 'Notifications retrieved successfully',
      statusCode: 200,
      body: {count, data, page, perPage},
    });
  }
  static notificationsCountRetrievedSuccessfully({notificationsCount}) {
    return new AppResponse({
      message: 'Notifications count retrieved successfully',
      statusCode: 200,
      body: {notificationsCount},
    });
  }
  static updatedNotificationsRetrievedSuccessfully({notifications}) {
    return new AppResponse({
      message: 'Updated notifications retrieved successfully',
      statusCode: 200,
      body: {notifications},
    });
  }
};
