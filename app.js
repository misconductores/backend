const express = require('express');
const Sentry = require('@sentry/node');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const config = require('config');

const v1 = require('./apiVersions/v1');
const {
  refreshTokenMiddleware,
  finalResponseMiddleware,
  errorMiddleware,
} = require('./middleware');
const {corsOrigin} = require('./utils');
const {documentDeleteCronJob} = require('./utils/cron-jobs/documents');
const {expirePendingOffers} = require('./utils/cron-jobs/offers');

const app = express();

Sentry.init({
  dsn: config.get('sentryDsn'),
  integrations: [
    new Sentry.Integrations.Http({tracing: true}),
    new Sentry.Integrations.Express({app}),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.use(express.json());

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({origin: corsOrigin, credentials: true}));

v1.prepareV1Routes(app);

app.get('/awake', (req, res) => {
  res.json();
});

// All other GET requests not handled before will return simple HTML
app.use((req, res, next) => {
  res.status(200).setHeader('Content-Type', 'text/html');
  res.end('<html><body><h1>This is an Express Server</h1></body></html>');
});

app.use(refreshTokenMiddleware);

app.use(Sentry.Handlers.errorHandler());

app.use(errorMiddleware);
app.use(finalResponseMiddleware);

documentDeleteCronJob.start();

expirePendingOffers();

if (config.get('env') !== config.get('envVariables.test')) {
  const PORT = config.get('port') || 3001;
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
}

module.exports = app;
