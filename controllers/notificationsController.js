const {NotificationsResponsesFactory} = require('../factories');
const {NotificationsServices} = require('../services');

module.exports = class NotificationsController {
    static async createVerificationProgressNotification(req, res, next) {
      try {
        const { userId, relatedUserId } = req.body;
        if (!userId || !relatedUserId) {
          return res.status(400).json({ error: 'userId y relatedUserId son requeridos' });
        }
        const result = await NotificationsServices.createNotification({
          userId,
          relatedUserId,
          type: require('../constants/usersConstants').notificationTypes.verification_progress.value,
        });
        if (result.success) {
          return res.status(201).json({ success: true });
        } else {
          return res.status(500).json({ error: 'No se pudo crear la notificación' });
        }
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }
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

  static async getUnreadNotificationsCount(req, res, next) {
    const userId = req.jwtToken.user.id;

    const {success, count, error} =
      await NotificationsServices.getUnreadNotifications({userId});

    if (success)
      return next(
        NotificationsResponsesFactory.notificationsCountRetrievedSuccessfully({
          notificationsCount: count,
        })
      );

    if (error) throw error;
  }

  static async updateNotificationReadStatus(req, res, next) {
    const {notificationIds} = req.body;

    const {success, error, updatedNotifications} =
      await NotificationsServices.updateNotificationReadStatus({
        notificationIds,
      });

    if (success)
      next(
        NotificationsResponsesFactory.updatedNotificationsRetrievedSuccessfully(
          {notifications: updatedNotifications}
        )
      );

    if (error) throw error;
  }
};
