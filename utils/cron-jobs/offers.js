const {TIMEZONES, statusTypes} = require('../../constants/usersConstants');
const {OffersModel} = require('../../models');
const {CronJob} = require('cron');
const {getDate7DaysAgo} = require('../DateCalculations');

exports.expirePendingOffers = async () => {
  const schedule = '0 0 1 * * *'; // at 01:00:00 every day
  const cb = () => async () => {
    try {
      const expiryDate = getDate7DaysAgo();
      const pendingOffers = await OffersModel.find({
        status: statusTypes.pending.value,
        createdAt: {$lte: expiryDate},
      });
      if (pendingOffers.length > 0) {
        for (const offer of pendingOffers) {
          offer.status = statusTypes.expired.value;
          await offer.save();
        }
      }
    } catch (error) {
      console.log('Expired offer cron job failed', error);
    }
  };

  Object.values(TIMEZONES).map(({value: timezone}) => {
    return new CronJob(schedule, cb(), null, true, timezone);
  });
};
