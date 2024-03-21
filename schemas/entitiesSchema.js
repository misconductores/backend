const Yup = require('yup');
const {validatorUtils} = require('../utils');

const commonEntitySchema = {
  title: Yup.string().required(),
};

const validateCreateEntityBody = (entity) => {
  const schema = Yup.object().shape({
    ...commonEntitySchema,
  });

  return validatorUtils.validate(schema, entity);
};
const validateUpdateEntityBody = (entity) => {
  const schema = Yup.object().shape({
    ...commonEntitySchema,
  });

  return validatorUtils.validate(schema, entity);
};

const validateEntityIdParams = (entity) => {
  const schema = Yup.object().shape({
    id: validatorUtils.mongooseIdValidate('Entity'),
  });
  return validatorUtils.validate(schema, entity);
};

module.exports = {
  validateCreateEntityBody,
  validateEntityIdParams,
  validateUpdateEntityBody,
};
