const express = require('express');
const {UsersController} = require('../controllers');
const {validatorMiddleware, authMiddleware} = require('../middleware');
const {catchAsync} = require('../utils');
const {usersSchema, othersSchema} = require('../schemas');
const {uploadImage} = require('../middleware/uploadImageMiddleware');
const {uploadDocument} = require('../middleware/documentUploadMiddleware');
const {
  PARAMS_PROPERTY,
  QUERY_PROPERTY,
} = require('../constants/usersConstants');
const router = express.Router();

router.get(
  '/drivers',
  authMiddleware,
  validatorMiddleware(othersSchema.validatePaginationParams, QUERY_PROPERTY),
  catchAsync(UsersController.getDriversList)
);
router.get(
  '/companies',
  authMiddleware,
  validatorMiddleware(othersSchema.validatePaginationParams, QUERY_PROPERTY),
  catchAsync(UsersController.getCompaniesList)
);

router.get(
  '/me',
  authMiddleware,
  catchAsync(UsersController.getLoggedInUserInformation)
);

router.get(
  '/:id',
  authMiddleware,
  catchAsync(UsersController.getUserInformation)
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

router.post(
  '/pre-register-documents',
  uploadDocument.single('image'),
  validatorMiddleware(usersSchema.validateUploadDocumentRequest),
  catchAsync(UsersController.uploadPreRegisterDocuments)
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

router.delete(
  '/pre-register-document/:key',
  validatorMiddleware(
    usersSchema.validatePreRegisterDeleteDocumentParams,
    PARAMS_PROPERTY
  ),
  catchAsync(UsersController.deletePreRegisterDocuments)
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

router.get(
  '/postal-codes/:postalCode',
  validatorMiddleware(usersSchema.validatePostalCodeParams, PARAMS_PROPERTY),
  catchAsync(UsersController.getPostalCodes)
);

module.exports = router;
