const {QUERY_PROPERTY} = require('../constants/usersConstants');
const {NotificationsController} = require('../controllers');
const {authMiddleware, validatorMiddleware} = require('../middleware');
const {othersSchema} = require('../schemas');
const {catchAsync} = require('../utils');

const router = require('express').Router();

router.get(
  '/',
  authMiddleware,
  validatorMiddleware(othersSchema.validatePaginationParams, QUERY_PROPERTY),
  catchAsync(NotificationsController.getNotificationsOfLoggedInUser)
);

module.exports = router;
