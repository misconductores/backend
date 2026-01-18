const AppError = require('./AppError');
const GeneralErrorsFactory = require('./general');
const UsersErrorsFactory = require('../errors/users');
const AuthErrors = require('./AuthErrors');
const JobErrors = require('./jobs');
const OthersErrors = require('./others');
const OffersErrors = require('./offers');
const ConnectionErrors = require('./connections');
const ReviewsErrors = require('./reviews');
const DocumentsAccessErrors = require('./documentsAccess');
const SubscriptionsErrors = require('./subscriptions');
const PaymentIntegrationErrorsFactory = require('./paymentIntegration');

module.exports = {
  AppError,
  GeneralErrorsFactory,
  UsersErrorsFactory,
  AuthErrors,
  JobErrors,
  OthersErrors,
  OffersErrors,
  ConnectionErrors,
  ReviewsErrors,
  DocumentsAccessErrors,
  SubscriptionsErrors,
  PaymentIntegrationErrorsFactory,
};
