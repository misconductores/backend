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

    console.log(
      '\n- Start by removing all the dependencies from package.json file',
      '\n- Run the following command to install all the dependencies at once with latest versions: npm i @sendgrid/mail @sentry/node bcrypt body-parser config cookie-parser cors cron dotenv express jsonwebtoken lodash mongoose winston winston-transport-sentry-node yup',
      '\n- Also run the following command for dev dependencies: npm i -D nodemon',
      '\n- Then remove these lines from index file\n'
    );
  };

  testOnDevelopment();
}
