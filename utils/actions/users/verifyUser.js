const config = require('config');
const emailNotificationProcesses = require('../../email/processes');

module.exports = async ({user}) => {
  const domain = config.get('frontendURL');
  const verifyUrl = `${domain}/auth/verify/${user.verificationToken}`;
  await emailNotificationProcesses.verifyUser({user, verifyUrl});
};
