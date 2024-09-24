const {roles} = require('../constants/usersConstants');
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

router.post(
  '/free',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.company.value]}),
  blockExistingSubscribers,
  catchAsync(SubscriptionsController.activateFreeSubscription)
);

router.post('/webhook', catchAsync(SubscriptionsController.webhook));

router.post(
  '/pro',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.company.value]}),
  validatorMiddleware(subscriptionsSchema.validatePrepareSubscriptionReq),
  blockExistingSubscribers,
  catchAsync(SubscriptionsController.prepareSubscription)
);

module.exports = router;
