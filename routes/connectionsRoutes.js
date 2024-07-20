const {roles} = require('../constants/usersConstants');
const {ConnectionsController} = require('../controllers');
const {
  authMiddleware,
  roleValidatorMiddleware,
  findConnectionMiddleware,
  isReviewExistMiddleware,
} = require('../middleware');
const {catchAsync} = require('../utils');

const router = require('express').Router();

router.post(
  '/driver-disconnect',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.driver.value]}),
  isReviewExistMiddleware,
  findConnectionMiddleware,
  catchAsync(ConnectionsController.disconnectionByDriver)
);

module.exports = router;
