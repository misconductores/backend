const {
  PARAMS_PROPERTY,
  roles,
  driverStatuses,
} = require('../constants/usersConstants');
const {OffersController} = require('../controllers');
const {
  authMiddleware,
  validatorMiddleware,
  roleValidatorMiddleware,
  checkDriverStatusMiddleware,
} = require('../middleware');
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
  roleValidatorMiddleware({allowedRoles: [roles.driver.value]}),
  checkDriverStatusMiddleware({
    driverStatuses: [
      driverStatuses.connected.value,
      driverStatuses.availableSoon.value,
    ],
  }),
  catchAsync(OffersController.acceptOffer)
);

router.patch(
  '/:id/reject',
  authMiddleware,
  validatorMiddleware(offersSchema.validateUpdateOfferParams, PARAMS_PROPERTY),
  roleValidatorMiddleware({allowedRoles: [roles.driver.value]}),
  catchAsync(OffersController.rejectOffer)
);

module.exports = router;
