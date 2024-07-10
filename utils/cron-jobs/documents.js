const cron = require('node-cron');
const {UsersServices} = require('../../services');

exports.documentDeleteCronJob = cron.schedule('0 12 * * *', async () => {
  await UsersServices.deleteAllDocuments();
});
