const {OthersController} = require('../controllers');
const {catchAsync} = require('../utils');

const router = require('express').Router();

router.get('/city-list', catchAsync(OthersController.getCitiesList));

module.exports = router;
