const CronJob = require('cron').CronJob;

async function createCronJob(timer, action, successMessage, failureMessage) {
  let someJob = new CronJob(timer, async function () {
    try {
      await action();
      console.log(`${successMessage} at ${Date()}`);
    } catch (err) {
      console.log(`${failureMessage} at ${Date()}`);
    }
  });
  return someJob;
}

module.exports.setupAwakeJob = async (frequencyInMinutes) => {
  let awakeJob = await createCronJob(
    `*/${frequencyInMinutes} * * * *`,
    async () => {
      console.log('setup the GET request to wake up the server here');
    },
    `Successfully awaken the service`,
    `Couldn't awake the service`
  );

  awakeJob.start();
};
