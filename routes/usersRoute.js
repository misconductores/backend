const express = require('express');
const {UsersController} = require('../controllers');
const {validatorMiddleware, authMiddleware} = require('../middleware');
const {catchAsync} = require('../utils');
const {usersSchema} = require('../schemas');

const router = express.Router();

router.get(
  '/me',
  authMiddleware,
  catchAsync(UsersController.getLoggedInUserInformation)
);

router.post(
  '/login',
  validatorMiddleware(usersSchema.validateLoginRequest),
  catchAsync(UsersController.loginUser)
);

router.post(
  '/signup',
  validatorMiddleware(usersSchema.validateCreateRequest),
  catchAsync(UsersController.createUser)
);

router.post(
  '/forgot-password',
  validatorMiddleware(usersSchema.validateEmail),
  catchAsync(UsersController.forgetPassword)
);

router.patch(
  '/reset/:token',
  validatorMiddleware(usersSchema.validateResetPasswordRequest),
  catchAsync(UsersController.resetPassword)
);

router.post('/logout', catchAsync(UsersController.logout));

router.post('/verify/new/:token', catchAsync(UsersController.verifyUser));

router.post(
  '/verify/refresh',
  validatorMiddleware(usersSchema.validateEmail),
  catchAsync(UsersController.regenerateVerifyToken)
);

module.exports = router;
