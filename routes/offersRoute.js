const {
  PARAMS_PROPERTY,
  roles,
  driverStatuses,
  QUERY_PROPERTY,
} = require('../constants/usersConstants');
const {OffersController} = require('../controllers');
const {
  authMiddleware,
  validatorMiddleware,
  roleValidatorMiddleware,
  checkDriverStatusMiddleware,
  isCompanyJobCheckMiddleware,
} = require('../middleware');
const {offersSchema, othersSchema} = require('../schemas');
const {catchAsync} = require('../utils');
const router = require('express').Router();

router.get(
  '/driver',
  authMiddleware,
  validatorMiddleware(othersSchema.validatePaginationParams, QUERY_PROPERTY),
  roleValidatorMiddleware({allowedRoles: [roles.driver.value]}),
  catchAsync(OffersController.getOffersByDriverId)
);

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

router.get(
  '/:jobId',
  authMiddleware,
  validatorMiddleware(othersSchema.validatePaginationParams, QUERY_PROPERTY),
  roleValidatorMiddleware({allowedRoles: [roles.company.value]}),
  isCompanyJobCheckMiddleware,
  catchAsync(OffersController.getOffersByJobId)
);

module.exports = router;
