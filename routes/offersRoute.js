const {roles} = require('../constants/usersConstants');
const {OffersController} = require('../controllers');
const {
  authMiddleware,
  validatorMiddleware,
  roleValidatorMiddleware,
} = require('../middleware');
const {offersSchema} = require('../schemas');
const {catchAsync} = require('../utils');
const router = require('express').Router();

router.post(
  '/',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.company.value]}),
  validatorMiddleware(offersSchema.validateCreateOfferReq),
  catchAsync(OffersController.sendOffer)
);

router.patch('/:id/accept', authMiddleware);

router.patch('/:id/reject', authMiddleware);

module.exports = router;
