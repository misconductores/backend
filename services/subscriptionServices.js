const {
  subscriptionModes,
  subscriptionTypes,
} = require('../constants/usersConstants');
const {SubscriptionsModel, SubscriptionHistoryModel} = require('../models');
const {
  getCurrentDate,
  getDateAfterOneMonth,
} = require('../utils/DateCalculations');
const GeneralServices = require('./generalServices');

module.exports = class SubscriptionsServices {
  static async getSubscriptionByUserId({userId}) {
    try {
      const {doc: subscription} = await GeneralServices.findOne({
        query: {userId},
        model: SubscriptionsModel,
      });
      return {success: true, subscription};
    } catch (error) {
      return {success: false, error};
    }
  }

  static async createFreeSubscriptionHistory({subscription}) {
    try {
      const data = {
        subscriptionId: subscription.id,
        transactionId: null,
        amount: 0,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        subscriptionMode: subscription.subscriptionMode,
        subscriptionType: subscription.subscriptionType,
      };
      await GeneralServices.create({
        data: data,
        model: SubscriptionHistoryModel,
      });
      return {success: true};
    } catch (error) {
      return {success: false, error};
    }
  }

  static async activateFreeSubscription({userId}) {
    try {
      const data = {
        userId,
        providerSubscriptionId: null,
        subscriptionProviders: null,
        startDate: getCurrentDate(),
        endDate: getDateAfterOneMonth(),
        subscriptionMode: subscriptionModes.free.value,
        subscriptionType: subscriptionTypes.monthly.value,
      };

      const {doc: subscription} = await GeneralServices.create({
        data,
        model: SubscriptionsModel,
      });
      if (subscription) {
        await SubscriptionsServices.createFreeSubscriptionHistory({
          subscription,
        });
      }
      return {success: true, subscription};
    } catch (error) {
      return {success: false, error};
    }
  }
};
