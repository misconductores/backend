const resetPassword = require('./resetPassword');
const verifyUser = require('./verifyUser');
const documentExpirationWarning = require('./documentExpirationWarning');
const documentExpired = require('./documentExpired');
const newJobPosted = require('./newJobPosted');

module.exports = {
  resetPassword,
  verifyUser,
  documentExpirationWarning,
  documentExpired,
  newJobPosted,
};
