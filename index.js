require('dotenv').config();

const config = require('config');

const app = require('./app');
const {mongoose} = require('./models'); // import connection

const {cronJobsUtils} = require('./utils');

if (config.get('env') == config.get('envVariables.prod')) {
  cronJobsUtils.setupAwakeJob(config.get('awakeJobFrequencyInMinutes'));
}

if (config.get('env') == config.get('envVariables.dev')) {
  const testOnDevelopment = async () => {
    try {
      console.log('Testing something on development environment');
    } catch (err) {
      console.dir(err, {depth: null});
    }
  };

  testOnDevelopment();
}
