const {roles} = require('../constants/usersConstants');
const {OthersController} = require('../controllers');
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

module.exports = router;
