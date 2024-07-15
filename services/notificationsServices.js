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
};
