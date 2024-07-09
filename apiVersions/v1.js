const {authMiddleware} = require('../middleware');
const {
  usersRoute,
  publicRoute,
  privateRoute,
  jobsRoute,
  othersRoute,
  offersRoute,
} = require(`../routes`);

const apiPrefix = '/api/v1/';
const prepareV1Routes = (app) => {
  app.use(`${apiPrefix}users`, usersRoute); // This route is public mostly and whenever it's not, it's protected by the authMiddleware inside the specific route
  app.use(`${apiPrefix}jobs`, jobsRoute);
  app.use(`${apiPrefix}others`, othersRoute);
  app.use(`${apiPrefix}offers`, offersRoute);
  app.use(`${apiPrefix}public`, publicRoute);
  app.use(`${apiPrefix}private`, authMiddleware, privateRoute);
};

module.exports = {apiPrefix, prepareV1Routes};
