const {roles} = require('../constants/usersConstants');
const {ConnectionsController} = require('../controllers');
const {
  authMiddleware,
  roleValidatorMiddleware,
  findConnectionMiddleware,
  isReviewExistMiddleware,
  validatorMiddleware,
} = require('../middleware');
const {reviewsSchema} = require('../schemas');
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

router.post(
  '/company-disconnect',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.company.value]}),
  validatorMiddleware(reviewsSchema.validateCompanyDisconnectReq),
  isReviewExistMiddleware,
  findConnectionMiddleware,
  catchAsync(ConnectionsController.disconnectionByCompany)
);

module.exports = router;
