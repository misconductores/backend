const express = require('express');
const {UsersController} = require('../controllers');
const {validatorMiddleware, authMiddleware} = require('../middleware');
const {catchAsync} = require('../utils');
const {usersSchema} = require('../schemas');
const {uploadImage} = require('../middleware/uploadImageMiddleware');
const {uploadDocument} = require('../middleware/documentUploadMiddleware');
const {PARAMS_PROPERTY} = require('../constants/usersConstants');
const router = express.Router();

router.get(
  '/me',
  authMiddleware,
  catchAsync(UsersController.getLoggedInUserInformation)
);

router.patch(
  '/profile-image',
  uploadImage.single('image'),
  authMiddleware,
  catchAsync(UsersController.updateProfileImage)
);

router.patch(
  '/documents',
  uploadDocument.single('image'),
  authMiddleware,
  validatorMiddleware(usersSchema.validateUploadDocumentRequest),
  catchAsync(UsersController.uploadDocuments)
);

router.delete(
  '/document/:label',
  authMiddleware,
  validatorMiddleware(
    usersSchema.validateDeleteDocumentParams,
    PARAMS_PROPERTY
  ),
  catchAsync(UsersController.deleteDocuments)
);

router.patch(
  '/profile',
  authMiddleware,
  validatorMiddleware(usersSchema.validateUpdateProfileRequest),
  catchAsync(UsersController.updateProfile)
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
