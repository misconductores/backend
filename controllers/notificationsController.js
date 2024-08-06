const {NotificationsResponsesFactory} = require('../factories');
const {NotificationsServices} = require('../services');

module.exports = class NotificationsController {
  static async getNotificationsOfLoggedInUser(req, res, next) {
    const userId = req.jwtToken.user.id;

    let {page, limit} = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const {success, error, result} =
      await NotificationsServices.getNotificationsByUserId({
        userId,
        limit,
        page,
      });

    if (success)
      return next(
        NotificationsResponsesFactory.notificationsRetrievedSuccessfully({
          count: result.totalCount,
          data: result.data,
          page,
          perPage: limit,
        })
      );

    if (error) throw error;
  }
};
