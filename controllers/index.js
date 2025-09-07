const UsersController = require(`./usersController`);
const GeneralController = require(`./generalController`);
const JobsController = require('./jobsController');
const OthersController = require('./othersController');
const OffersController = require('./offersController');
const ConnectionsController = require('./connectionsController');
const ReviewsController = require('./reviewsController');
const DocumentsAccessController = require('./documentsAccessController');
const NotificationsController = require('./notificationsController');
const SubscriptionsController = require('./subscriptionsController');
const PaymentIntegrationController = require('./paymentIntegrationController');
const BackgroundCheckController = require('./backgroundCheckController');
const CreditsController = require('./creditsController');

module.exports = {
  UsersController,
  GeneralController,
  JobsController,
  OthersController,
  OffersController,
  ConnectionsController,
  ReviewsController,
  DocumentsAccessController,
  NotificationsController,
  SubscriptionsController,
  PaymentIntegrationController,
  BackgroundCheckController,
  CreditsController,
};
