const {OthersController} = require('../controllers');
const {catchAsync} = require('../utils');

const router = require('express').Router();

router.get('/cities', catchAsync(OthersController.getCitiesList));

module.exports = router;
