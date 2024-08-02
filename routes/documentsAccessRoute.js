const {roles} = require('../constants/usersConstants');
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

module.exports = router;
