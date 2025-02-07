const {roles} = require('../constants/usersConstants');
const {OthersController, UsersController} = require('../controllers');
const {authMiddleware, roleValidatorMiddleware} = require('../middleware');
const {catchAsync} = require('../utils');

const router = require('express').Router();

router.get('/cities', catchAsync(OthersController.getCitiesList));

router.get(
  '/counters',
  authMiddleware,
  roleValidatorMiddleware({
    allowedRoles: [roles.driver.value, roles.company.value],
  }),
  catchAsync(OthersController.getCounters)
);

router.get(
  '/services',
  authMiddleware,
  roleValidatorMiddleware({
    allowedRoles: [roles.driver.value],
  }),
  catchAsync(UsersController.getServicesList)
);


module.exports = router;
