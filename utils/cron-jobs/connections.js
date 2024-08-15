const {
  TIMEZONES,
  connectionStatuses,
  driverStatuses,
} = require('../../constants/usersConstants');
const {CronJob} = require('cron');
const logger = require('../../middleware/loggerMiddleware');
const {ConnectionsModel, UsersModel} = require('../../models');
const {getCurrentDate} = require('../DateCalculations');
const {GeneralServices} = require('../../services');

exports.updateConnectionsToInactive = async () => {
  const schedule = '0 0 1 * * *'; // at 01:00:00 every day
  const cb = () => async () => {
    try {
      const connectionsToUpdate = await ConnectionsModel.find({
        reviewEndDate: {$lte: getCurrentDate()},
        status: connectionStatuses.pending.value,
      });

      if (connectionsToUpdate.length > 0) {
        await ConnectionsModel.updateMany(
          {
            _id: {
              $in: connectionsToUpdate.map((connection) => connection._id),
            },
          },
          {status: connectionStatuses.inactive.value, endDate: getCurrentDate()}
        );

        for (const connection of connectionsToUpdate) {
          const {doc: driver} = await GeneralServices.findById({
            id: connection.driverId,
            model: UsersModel,
          });
          if (
            (!connection.driverReviewId || !connection.companyReviewId) &&
            driver.driverStatus !== driverStatuses.underInspection.value
          ) {
            await GeneralServices.update({
              id: connection.driverId,
              data: {driverStatus: driverStatuses.available.value},
              model: UsersModel,
            });
          }
        }
      } else {
        logger.info('No connections to update');
      }
    } catch (error) {
      logger.error(error);
    }
  };

  Object.values(TIMEZONES).map(({value: timezone}) => {
    return new CronJob(schedule, cb(), null, true, timezone);
  });
};
