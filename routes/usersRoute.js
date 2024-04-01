const express = require('express');
const {UsersController} = require('../controllers');
const {validatorMiddleware, authMiddleware} = require('../middleware');
const {catchAsync, filesUtils} = require('../utils');
const {usersSchema} = require('../schemas');
const multer = require('multer');
const {filesConstants} = require('../constants');
const {uploadImage} = require('../middleware/uploadImageMiddleware');
const {uploadDocument} = require('../middleware/documentUploadMiddleware');
const router = express.Router();

router.get(
  '/me',
  authMiddleware,
  catchAsync(UsersController.getLoggedInUserInformation)
);

router.patch(
  '/update-profile-image',
  uploadImage.single('image'),
  authMiddleware,
  catchAsync(UsersController.updateProfileImage)
);

router.patch(
  '/driver-documents',
  uploadDocument.single('image'),
  authMiddleware,
  validatorMiddleware(usersSchema.validateUploadDocumentRequest),
  catchAsync(UsersController.uploadDocuments)
);

router.patch(
  '/delete-documents',
  authMiddleware,
  validatorMiddleware(usersSchema.validateUploadDocumentRequest),
  catchAsync(UsersController.deleteDocuments)
);

router.patch(
  '/update-profile',
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
