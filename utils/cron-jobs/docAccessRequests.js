const {TIMEZONES, statusTypes} = require('../../constants/usersConstants');
const {DocumentAccessModel} = require('../../models');
const {CronJob} = require('cron');
const {getDate7DaysAgo, getCurrentDate} = require('../DateCalculations');

exports.expirePendingDocsAccessRequests = async () => {
  const schedule = '0 0 1 * * *'; // at 01:00:00 every day
  const cb = () => async () => {
    try {
      await DocumentAccessModel.updateMany(
        {
          status: statusTypes.accepted.value,
          endDate: {$lt: getCurrentDate()},
        },
        {
          $set: {status: statusTypes.expired.value},
        }
      );
      await DocumentAccessModel.updateMany(
        {
          status: statusTypes.pending.value,
          createdAt: {$lt: getDate7DaysAgo()},
        },
        {
          $set: {status: statusTypes.expired.value},
        }
      );
    } catch (error) {
      console.log('Expired documents access cron job failed', error);
    }
  };

  Object.values(TIMEZONES).map(({value: timezone}) => {
    return new CronJob(schedule, cb(), null, true, timezone);
  });
};
