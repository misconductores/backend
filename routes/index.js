const usersRoute = require(`./usersRoute`);
const publicRoute = require(`./publicRoute`);
const privateRoute = require(`./privateRoute.js`);
const jobsRoute = require('./jobsRoute.js');
const othersRoute = require('./othersRoute.js');
const offersRoute = require('./offersRoute.js');
const connectionsRoute = require('./connectionsRoutes.js');
const reviewsRoute = require('./reviewsRoute.js');
const documentsAccessRoute = require('./documentsAccessRoute.js');
const notificationsRoute = require('./notificationsRoute.js');
const subscriptionsRoute = require('./subscriptionsRoute.js');
const paymentIntegrationRoute = require('./paymentIntegrationRoute.js');

module.exports = {
  usersRoute,
  publicRoute,
  privateRoute,
  jobsRoute,
  othersRoute,
  offersRoute,
  connectionsRoute,
  reviewsRoute,
  documentsAccessRoute,
  notificationsRoute,
  subscriptionsRoute,
  paymentIntegrationRoute,
};
