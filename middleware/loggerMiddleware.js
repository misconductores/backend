const winston = require('winston');
const config = require('config');
const Sentry = require('winston-transport-sentry-node').default;
const {isEnvDev} = require('./../utils/general');

const {combine, timestamp, json, errors} = winston.format;

const sentryTransport = new Sentry({
  sentry: {
    dsn: config.get('sentryDsn'),
    environment: config.get('env'),
    tracesSampleRate: 1.0,
  },
  level: 'error',
});

// Console transport para todos los ambientes (Heroku necesita logs en stdout)
const consoleTransport = new winston.transports.Console({
  level: 'info',
  format: winston.format.simple(), // Formato simple para Heroku
});

const transportsObj = {
  console: consoleTransport,
  sentry: sentryTransport,
};

if (isEnvDev) {
  transportsObj.sentry.level = 'info';
}

const logger = winston.createLogger({
  level: 'info',
  exitOnError: false,
  format: combine(timestamp(), errors({stack: true}), json()),
  transports: Object.values(transportsObj),
});

module.exports = logger;
