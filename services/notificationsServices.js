const {NotificationsModel} = require('../models');
const GeneralServices = require('./generalServices');

module.exports = class NotificationsServices {
  static async createNotification({userId, relatedUserId, type}) {
    try {
      await GeneralServices.create({
        model: NotificationsModel,
        data: {userId, relatedUserId, type},
      });
      return {success: true};
    } catch (err) {
      return {success: false, err};
    }
  }

  static async getNotifications({query}) {
    try {
      const notifications = await NotificationsModel.find(query).populate({
        path: 'userId relatedUserId',
        select: 'firstName lastName companyName profilePic',
      });
      return {success: true, notifications};
    } catch (error) {
      return {success: false, error};
    }
  }

  static async getNotificationsByUserId({userId, page, limit}) {
    try {
      const skip = (page - 1) * limit;

      const [totalCount, data] = await Promise.all([
        NotificationsModel.countDocuments({userId: userId}),
        NotificationsModel.find(
          {
            userId: userId,
          },
          null,
          {skip, limit, sort: {createdAt: -1}}
        ).populate({
          path: 'userId relatedUserId',
          select: 'firstName lastName companyName profilePic',
        }),
      ]);
      return {success: true, result: {totalCount, data}};
    } catch (error) {
      return {success: false, error};
    }
  }
  static async getUnreadNotifications({userId}) {
    try {
      const notificationsCount = await NotificationsModel.countDocuments({
        userId: userId,
        isRead: false,
      });
      return {success: true, count: notificationsCount};
    } catch (error) {
      return {success: false, error};
    }
  }

  static async updateNotificationReadStatus({notificationIds}) {
    try {
      await NotificationsModel.updateMany(
        {_id: {$in: notificationIds}},
        {$set: {isRead: true}}
      );

      // get updated notifications
      const {notifications} = await NotificationsServices.getNotifications({
        query: {_id: {$in: notificationIds}},
      });

      return {success: true, updatedNotifications: notifications};
    } catch (error) {
      return {success: false, error};
    }
  }
};
