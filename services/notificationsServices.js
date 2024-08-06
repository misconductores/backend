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
};
