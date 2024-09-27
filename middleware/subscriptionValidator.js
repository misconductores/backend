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
      const isDriverUser = role === roles.driver.value;

      req.isFreeSubscription = false;

      const {doc: subscription} = await GeneralServices.findOne({
        query: {userId},
        model: SubscriptionsModel,
        status: subscriptionStatuses.active.value,
      });

      if (!subscription && isDriverUser) return next();

      if (!subscription && isCompanyUser)
        return next(GeneralErrorsFactory.forbiddenRoleErr());

      const isFreeSubscription =
        subscription.subscriptionMode === subscriptionModes.free.value;

      const isProSubscription =
        subscription.subscriptionMode === subscriptionModes.paid.value;

      const isProSubscriptionExpired =
        isProSubscription &&
        subscription.status === subscriptionStatuses.expired.value;

      const hasNoActiveProSubscription =
        isFreeSubscription || isProSubscriptionExpired;

      // subscription validation for job posting
      if (requestType === requestTypes.jobPost.value) {
        const jobCount = await JobModel.countDocuments({companyId: userId});
        const isOneOrMoreJobs = jobCount >= 1;

        if (hasNoActiveProSubscription && isOneOrMoreJobs) {
          return next(JobErrors.forbiddenJobPostErr());
        }
      }

      // subscription validation for document request
      if (requestType === requestTypes.docAccess.value) {
        if (hasNoActiveProSubscription)
          return next(DocumentsAccessErrors.forbiddenDocRequestErr());
      }

      // subscription validation for document request
      if (requestType === requestTypes.reviewsAccess.value) {
        if (isCompanyUser && hasNoActiveProSubscription)
          return next(ReviewsErrors.forbiddenReviewsErr());
      }

      if (requestType === requestTypes.userData.value) {
        if (isCompanyUser && hasNoActiveProSubscription)
          req.isFreeSubscription = true;
      }

      next();
    } catch (error) {
      return next(GeneralErrorsFactory.internalErr({error}));
    }
  };
