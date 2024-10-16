const express = require('express');
const {UsersController} = require('../controllers');
const {
  validatorMiddleware,
  authMiddleware,
  roleValidatorMiddleware,
  subscriptionValidator,
  verifyDriverOfCompany,
} = require('../middleware');
const {catchAsync} = require('../utils');
const {usersSchema, othersSchema} = require('../schemas');
const {uploadImage} = require('../middleware/uploadImageMiddleware');
const {uploadDocument} = require('../middleware/documentUploadMiddleware');
const {
  PARAMS_PROPERTY,
  QUERY_PROPERTY,
  roles,
  requestTypes,
} = require('../constants/usersConstants');
const router = express.Router();

router.get(
  '/blocked-drivers',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.admin.value]}),
  catchAsync(UsersController.getBlockedDrivers)
);

router.get(
  '/drivers',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.company.value]}),
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
  verifyDriverOfCompany,
  subscriptionValidator({requestType: requestTypes.userData.value}),
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

router.post(
  '/check-email',
  validatorMiddleware(usersSchema.validateCheckEmailRequest),
  catchAsync(UsersController.checkRegisteredEmail)
);

router.patch(
  '/:userId/reject-and-block',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.admin.value]}),
  validatorMiddleware(usersSchema.validateBlockUnblockUserReq, PARAMS_PROPERTY),
  catchAsync(UsersController.rejectAndBlockDriver)
);

router.patch(
  '/:userId/block',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.admin.value]}),
  validatorMiddleware(usersSchema.validateBlockUnblockUserReq, PARAMS_PROPERTY),
  catchAsync(UsersController.blockDriver)
);

router.patch(
  '/:userId/unblock',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.admin.value]}),
  validatorMiddleware(usersSchema.validateBlockUnblockUserReq, PARAMS_PROPERTY),
  catchAsync(UsersController.unBlockDriver)
);

module.exports = router;
