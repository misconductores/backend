const {PARAMS_PROPERTY} = require('../constants/usersConstants');
const {OffersController} = require('../controllers');
const {authMiddleware, validatorMiddleware} = require('../middleware');
const {offersSchema} = require('../schemas');
const {catchAsync} = require('../utils');
const router = require('express').Router();

router.post(
  '/',
  authMiddleware,
  validatorMiddleware(offersSchema.validateCreateOfferReq),
  catchAsync(OffersController.sendOffer)
);

router.patch(
  '/:id/accept',
  authMiddleware,
  validatorMiddleware(offersSchema.validateUpdateOfferParams, PARAMS_PROPERTY),
  catchAsync(OffersController.acceptOffer)
);

router.patch('/:id/reject', authMiddleware);

module.exports = router;
