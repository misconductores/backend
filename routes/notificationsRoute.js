const {QUERY_PROPERTY} = require('../constants/usersConstants');
const {NotificationsController} = require('../controllers');
const {authMiddleware, validatorMiddleware} = require('../middleware');
const {othersSchema, notificationsSchema} = require('../schemas');
const {catchAsync} = require('../utils');

const router = require('express').Router();

router.get(
  '/',
  authMiddleware,
  validatorMiddleware(othersSchema.validatePaginationParams, QUERY_PROPERTY),
  catchAsync(NotificationsController.getNotificationsOfLoggedInUser)
);

router.get(
  '/unread-notifications-count',
  authMiddleware,
  catchAsync(NotificationsController.getUnreadNotificationsCount)
);

router.patch(
  '/mark-read',
  authMiddleware,
  validatorMiddleware(notificationsSchema.validateUpdateUnReadNotificationsReq),
  catchAsync(NotificationsController.updateNotificationReadStatus)
);

module.exports = router;
