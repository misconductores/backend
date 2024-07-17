const authMiddleware = require(`./authMiddleware`);
const validatorMiddleware = require(`./validatorMiddleware`);
const errorMiddleware = require(`./errorMiddleware`);
const refreshTokenMiddleware = require('./refreshTokenMiddleware');
const finalResponseMiddleware = require('./finalResponseMiddleware');
const loggerMiddleware = require('./loggerMiddleware');
const accessMiddleware = require('./accessMiddleware');
const roleValidatorMiddleware = require('./roleValidatorMiddleware');
const checkDriverStatusMiddleware = require('./checkDriverStatusMiddleware');
const forbidConnectedDrivers = require('./forbidConnectedDrivers');
const forbidResolvedOffers = require('./forbidResolvedOffers');

module.exports = {
  authMiddleware,
  validatorMiddleware,
  errorMiddleware,
  refreshTokenMiddleware,
  finalResponseMiddleware,
  logger: loggerMiddleware, // logger.error() sounds more appropriate than loggerMiddleware.error() IMO.
  accessMiddleware,
  roleValidatorMiddleware,
  checkDriverStatusMiddleware,
  forbidConnectedDrivers,
  forbidResolvedOffers,
};
