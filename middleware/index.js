const authMiddleware = require(`./authMiddleware`);
const validatorMiddleware = require(`./validatorMiddleware`);
const errorMiddleware = require(`./errorMiddleware`);
const refreshTokenMiddleware = require('./refreshTokenMiddleware');
const finalResponseMiddleware = require('./finalResponseMiddleware');
const loggerMiddleware = require('./loggerMiddleware');
const accessMiddleware = require('./accessMiddleware');
const roleValidatorMiddleware = require('./roleValidatorMiddleware');
const checkDriverStatusMiddleware = require('./checkDriverStatusMiddleware');
const checkDriverConnection = require('./checkDriverConnection');
const checkIsOfferResolved = require('./checkIsOfferResolved');

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
  checkDriverConnection,
  checkIsOfferResolved,
};
