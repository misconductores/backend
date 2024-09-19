const {roles} = require('../constants/usersConstants');
const {SubscriptionsController} = require('../controllers');
const {
  authMiddleware,
  roleValidatorMiddleware,
  blockExistingSubscribers,
} = require('../middleware');
const {catchAsync} = require('../utils');
const router = require('express').Router();

router.post(
  '/free',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.company.value]}),
  blockExistingSubscribers,
  catchAsync(SubscriptionsController.activateFreeSubscription)
);

module.exports = router;
