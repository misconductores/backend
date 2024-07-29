const {roles} = require('../constants/usersConstants');
const {DocumentsAccessController} = require('../controllers');
const {
  authMiddleware,
  roleValidatorMiddleware,
  validatorMiddleware,
} = require('../middleware');
const {documentAccessSchema} = require('../schemas');
const {catchAsync} = require('../utils');

const router = require('express').Router();

router.post(
  '/',
  authMiddleware,
  roleValidatorMiddleware({
    allowedRoles: [roles.company.value, roles.driver.value],
  }),
  validatorMiddleware(documentAccessSchema.validateSendDocsReq),
  catchAsync(DocumentsAccessController.accessRequestForDocuments)
);

module.exports = router;
