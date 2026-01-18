const AppResponse = require('./AppResponse');

const GeneralResponsesFactory = require('./general');
const UsersResponsesFactory = require('./users');
const JobResponsesFactory = require('./jobs');
const OthersResponsesFactory = require('./others');
const OffersResponsesFactory = require('./offers');
const ConnectionsResponsesFactory = require('./connections');
const ReviewsResponseFactory = require('./reviews');
const DocumentsAccessResponsesFactory = require('./documentsAccess');
const NotificationsResponsesFactory = require('./notifications');
const SubscriptionsResponsesFactory = require('./subscriptions');
const PaymentIntegrationResponsesFactory = require('./paymentIntegration');

module.exports = {
  AppResponse,
  GeneralResponsesFactory,
  UsersResponsesFactory,
  JobResponsesFactory,
  OthersResponsesFactory,
  OffersResponsesFactory,
  ConnectionsResponsesFactory,
  ReviewsResponseFactory,
  DocumentsAccessResponsesFactory,
  NotificationsResponsesFactory,
  SubscriptionsResponsesFactory,
  PaymentIntegrationResponsesFactory,
};
