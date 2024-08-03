const authMiddleware = require(`./authMiddleware`);
const validatorMiddleware = require(`./validatorMiddleware`);
const errorMiddleware = require(`./errorMiddleware`);
const refreshTokenMiddleware = require('./refreshTokenMiddleware');
const finalResponseMiddleware = require('./finalResponseMiddleware');
const loggerMiddleware = require('./loggerMiddleware');
const accessMiddleware = require('./accessMiddleware');
const roleValidatorMiddleware = require('./roleValidatorMiddleware');
const checkDriverStatusMiddleware = require('./checkDriverStatusMiddleware');
const isCompanyJobCheckMiddleware = require('./isCompanyJobCheckMiddleware');
const forbidConnectedDrivers = require('./forbidConnectedDrivers');
const forbidResolvedOffers = require('./forbidResolvedOffers');
const isCompanyDriverCheckMiddleware = require('./isCompanyDriverCheckMiddleware');
const isAlreadyDisconnectedMiddleware = require('./isAlreadyDisconnectedMiddleware');
const isDocumentAccessRequestExist = require('./isDocumentAccessRequestExist');
const verifyDocsRequestsMiddleware = require('./verifyDocsRequestsMiddleware');

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
  isCompanyJobCheckMiddleware,
  forbidConnectedDrivers,
  forbidResolvedOffers,
  isCompanyDriverCheckMiddleware,
  isAlreadyDisconnectedMiddleware,
  isDocumentAccessRequestExist,
  verifyDocsRequestsMiddleware,
};
