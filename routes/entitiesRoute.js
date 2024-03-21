const express = require('express');
const {GeneralController} = require('../controllers');
const {catchAsync} = require('../utils');
const {validatorMiddleware} = require('../middleware');
const {entitiesSchema} = require('../schemas');
const EntitiesModel = require('../models/EntitiesModel');
const router = express.Router();

const singularKey = 'entity';
const pluralKey = 'entity';

router.post(
  '/',
  validatorMiddleware(entitiesSchema.validateCreateEntityBody),
  catchAsync(GeneralController.create({model: EntitiesModel, key: singularKey}))
);
router.get(
  '/',
  catchAsync(GeneralController.findAll({model: EntitiesModel, key: pluralKey}))
);
router.delete(
  '/:id',
  validatorMiddleware(entitiesSchema.validateEntityIdParams, 'params'),
  catchAsync(GeneralController.delete({model: EntitiesModel, key: singularKey}))
);
router.patch(
  '/:id',
  validatorMiddleware(entitiesSchema.validateEntityIdParams, 'params'),
  validatorMiddleware(entitiesSchema.validateUpdateEntityBody),
  catchAsync(GeneralController.update({model: EntitiesModel, key: singularKey}))
);
module.exports = router;
