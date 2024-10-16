const {
  TIMEZONES,
  subscriptionModes,
} = require('../../constants/usersConstants');
const {CronJob} = require('cron');
const logger = require('../../middleware/loggerMiddleware');
const {
  getCurrentDate,
  calculateOneMonthAheadDate,
} = require('../DateCalculations');
const {SubscriptionsModel, SubscriptionHistoryModel} = require('../../models');

exports.updateFreeSubscriptions = async () => {
  const schedule = '0 0 1 * * *'; // at 01:00:00 every day
  const cb = () => async () => {
    try {
      const expiredSubscriptions = await SubscriptionsModel.find({
        subscriptionMode: subscriptionModes.free.value,
        endDate: {$lt: getCurrentDate()},
      });

      for (const subscription of expiredSubscriptions) {
        await SubscriptionHistoryModel.create({
          subscriptionId: subscription._id,
          transactionId: null, // Free mode not have a transaction ID
          amount: 0,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          subscriptionMode: subscription.subscriptionMode,
          subscriptionType: subscription.subscriptionType,
        });

        // Update subscription with new startDate and endDate
        subscription.startDate = subscription.endDate;
        subscription.endDate = calculateOneMonthAheadDate({
          date: subscription.startDate,
        });
        await subscription.save();
      }
    } catch (error) {
      logger.error(error);
    }
  };

  Object.values(TIMEZONES).map(({value: timezone}) => {
    return new CronJob(schedule, cb(), null, true, timezone);
  });
};
