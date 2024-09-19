const {roles} = require('../constants/usersConstants');
const {SubscriptionsController} = require('../controllers');
const {
  authMiddleware,
  roleValidatorMiddleware,
  isSubscriptionExist,
} = require('../middleware');
const {catchAsync} = require('../utils');
const router = require('express').Router();

router.post(
  '/free',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.company.value]}),
  isSubscriptionExist,
  catchAsync(SubscriptionsController.activateFreeSubscription)
);

module.exports = router;
