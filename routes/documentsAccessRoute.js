const {roles, QUERY_PROPERTY} = require('../constants/usersConstants');
const {DocumentsAccessController} = require('../controllers');
const {
  authMiddleware,
  roleValidatorMiddleware,
  validatorMiddleware,
  isDocumentAccessRequestExist,
} = require('../middleware');
const {documentAccessSchema} = require('../schemas');
const {catchAsync} = require('../utils');

const router = require('express').Router();

router.post(
  '/',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.company.value]}),
  validatorMiddleware(documentAccessSchema.validateSendDocsReq),
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

module.exports = router;
