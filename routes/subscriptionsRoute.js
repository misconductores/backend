const {roles, subscriptionModes} = require('../constants/usersConstants');
const {SubscriptionsController} = require('../controllers');
const {
  authMiddleware,
  roleValidatorMiddleware,
  blockExistingSubscribers,
  validatorMiddleware,
} = require('../middleware');
const {subscriptionsSchema} = require('../schemas');
const {catchAsync} = require('../utils');
const router = require('express').Router();

router.get(
  '/',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.company.value]}),
  catchAsync(SubscriptionsController.getUserSubscription)
);

router.get(
  '/plans',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.company.value]}),
  catchAsync(SubscriptionsController.getPlans)
);

router.post(
  '/free',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.company.value]}),
  blockExistingSubscribers({subscriptionMode: subscriptionModes.free.value}),
  catchAsync(SubscriptionsController.activateFreeSubscription)
);

router.post('/webhook', catchAsync(SubscriptionsController.webhook));

router.post(
  '/pro',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.company.value]}),
  validatorMiddleware(subscriptionsSchema.validatePrepareSubscriptionReq),
  blockExistingSubscribers({subscriptionMode: subscriptionModes.paid.value}),
  catchAsync(SubscriptionsController.prepareSubscription)
);

module.exports = router;
