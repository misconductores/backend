const resetPassword = require('./resetPassword');
const verifyUser = require('./verifyUser');
const documentExpirationWarning = require('./documentExpirationWarning');
const documentExpired = require('./documentExpired');

module.exports = {
  resetPassword,
  verifyUser,
  documentExpirationWarning,
  documentExpired,
};
