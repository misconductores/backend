const {
  requestTypes,
  subscriptionStatuses,
  subscriptionModes,
  roles,
} = require('../constants/usersConstants');
const {
  GeneralErrorsFactory,
  JobErrors,
  DocumentsAccessErrors,
  ReviewsErrors,
} = require('../factories');
const {SubscriptionsModel} = require('../models');
const JobModel = require('../models/JobModel');
const {GeneralServices} = require('../services');

module.exports =
  ({requestType}) =>
  async (req, res, next) => {
    try {
      const {id: userId, role} = req.jwtToken.user;
      const isCompanyUser = role === roles.company.value;

      req.isFreeSubscription = false;

      const {doc: subscription} = await GeneralServices.findOne({
        query: {userId},
        model: SubscriptionsModel,
        status: subscriptionStatuses.active.value,
      });

      if (!subscription) return next();

      const isFreeSubscription =
        subscription.subscriptionMode === subscriptionModes.free.value;

      const isProSubscription =
        subscription.subscriptionMode === subscriptionModes.paid.value;

      const isProSubscriptionExpired =
        isProSubscription &&
        subscription.status === subscriptionStatuses.expired.value;

      // subscription validation for job posting
      if (requestType === requestTypes.jobPost.value) {
        const jobs = await JobModel.find({companyId: userId});
        const isOneOrMoreJobs = jobs.length >= 1;

        if (
          (isFreeSubscription || isProSubscriptionExpired) &&
          isOneOrMoreJobs
        ) {
          return next(JobErrors.forbiddenJobPostErr());
        }
      }

      // subscription validation for document request
      if (requestType === requestTypes.docAccess.value) {
        if (isFreeSubscription || isProSubscriptionExpired)
          return next(DocumentsAccessErrors.forbiddenDocRequestErr());
      }

      // subscription validation for document request
      if (requestType === requestTypes.reviewsAccess.value) {
        if (isCompanyUser && (isFreeSubscription || isProSubscriptionExpired))
          return next(ReviewsErrors.forbiddenReviewsErr());
      }

      if (requestType === requestTypes.userData.value) {
        if (isCompanyUser && (isFreeSubscription || isProSubscriptionExpired))
          req.isFreeSubscription = true;
      }

      next();
    } catch (error) {
      return next(GeneralErrorsFactory.internalErr({error}));
    }
  };
