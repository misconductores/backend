const {
  roles,
  QUERY_PROPERTY,
  PARAMS_PROPERTY,
  driverStatuses,
  requestTypes,
} = require('../constants/usersConstants');
const {DocumentsAccessController} = require('../controllers');
const {
  authMiddleware,
  roleValidatorMiddleware,
  validatorMiddleware,
  isDocumentAccessRequestExist,
  verifyDocsRequestsMiddleware,
  forbidResolveDocsAccessRequests,
  checkDriverStatusMiddleware,
  subscriptionValidator,
} = require('../middleware');
const {documentAccessSchema} = require('../schemas');
const {catchAsync} = require('../utils');

const router = require('express').Router();

router.post(
  '/',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.company.value]}),
  validatorMiddleware(documentAccessSchema.validateSendDocsReq),
  subscriptionValidator({requestType: requestTypes.docAccess.value}),
  isDocumentAccessRequestExist,
  catchAsync(DocumentsAccessController.requestDocumentsAccess)
);

router.get(
  '/company-documents-requests',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.company.value]}),
  validatorMiddleware(
    documentAccessSchema.validateGetCompanyDocsRequests,
    QUERY_PROPERTY
  ),
  catchAsync(DocumentsAccessController.getDocumentAccessRequestsForCompany)
);

router.get(
  '/driver-documents-requests',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.driver.value]}),
  validatorMiddleware(
    documentAccessSchema.validateGetDriverDocsRequests,
    QUERY_PROPERTY
  ),
  catchAsync(DocumentsAccessController.getDocumentAccessRequestsForDriver)
);

router.get(
  '/:userId/requested-documents',
  authMiddleware,
  roleValidatorMiddleware({
    allowedRoles: [roles.company.value, roles.admin.value],
  }),
  validatorMiddleware(
    documentAccessSchema.validateGetRequestedDocsRequests,
    PARAMS_PROPERTY
  ),
  verifyDocsRequestsMiddleware,
  catchAsync(DocumentsAccessController.getRequestedDocuments)
);

router.patch(
  '/:id/status',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.driver.value]}),
  checkDriverStatusMiddleware({
    allowedDriverStatuses: [
      driverStatuses.available.value,
      driverStatuses.availableSoon.value,
      driverStatuses.waitingDecision.value,
      driverStatuses.connected.value,
    ],
  }),
  validatorMiddleware(documentAccessSchema.validateUpdateDocsRequestStatus),
  forbidResolveDocsAccessRequests,
  catchAsync(DocumentsAccessController.updateDocumentsRequestStatus)
);

router.patch(
  '/:id/remove-access',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.driver.value]}),
  validatorMiddleware(
    documentAccessSchema.validateRemoveDocsAccessReqParams,
    PARAMS_PROPERTY
  ),
  forbidResolveDocsAccessRequests,
  catchAsync(DocumentsAccessController.removeDocumentAccess)
);

module.exports = router;
