const {
  roles,
  QUERY_PROPERTY,
  driverStatuses,
} = require('../constants/usersConstants');
const {ConnectionsController} = require('../controllers');
const {
  authMiddleware,
  roleValidatorMiddleware,
  isAlreadyDisconnectedMiddleware,
  validatorMiddleware,
  checkDriverStatusMiddleware,
} = require('../middleware');
const {reviewsSchema, connectionsSchema} = require('../schemas');
const {catchAsync} = require('../utils');

const router = require('express').Router();

router.post(
  '/driver-disconnect',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.driver.value]}),
  checkDriverStatusMiddleware({
    allowedDriverStatuses: [
      driverStatuses.connected.value,
      driverStatuses.availableSoon.value,
    ],
  }),
  validatorMiddleware(reviewsSchema.validateDriverDisconnectReq),
  isAlreadyDisconnectedMiddleware,
  catchAsync(ConnectionsController.disconnectByDriver)
);

router.post(
  '/company-disconnect',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.company.value]}),
  validatorMiddleware(reviewsSchema.validateCompanyDisconnectReq),
  isAlreadyDisconnectedMiddleware,
  catchAsync(ConnectionsController.disconnectByCompany)
);

router.get(
  '/connected-company',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.driver.value]}),
  catchAsync(ConnectionsController.getConnectedCompany)
);

router.get(
  '/company-drivers',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.company.value]}),
  validatorMiddleware(
    connectionsSchema.validateGetCompanyDriversReq,
    QUERY_PROPERTY
  ),
  catchAsync(ConnectionsController.getCompanyDrivers)
);

router.get(
  '/job-history',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.driver.value]}),
  catchAsync(ConnectionsController.getDriverJobHistory)
);

module.exports = router;
