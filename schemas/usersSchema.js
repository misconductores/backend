const Yup = require('yup');

const {usersConstants} = require('../constants');
const {validatorUtils} = require('../utils');
const {driverSchema, commonFields, companySchema} = require('./commonSchema');

const commonAuthSchema = {
  email: Yup.string().email().required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(
      8,
      'Must contain at least 8 characters and at least 1 uppercase letter'
    )
    .matches(
      /[A-Z]/,
      'Must contain at least 8 characters and at least 1 uppercase letter'
    ),
};

module.exports.validateCreateRequest = (user) => {
  const schema = roleSwiperSchema(user);

  return validatorUtils.validate(schema, user);
};

module.exports.validateLoginRequest = (user) => {
  const schema = Yup.object().shape({
    email: commonAuthSchema.email,
    password: Yup.string().required('Password is required'),
  });

  return validatorUtils.validate(schema, user);
};

module.exports.validateEmail = (data) => {
  const schema = Yup.object().shape({email: commonAuthSchema.email});

  return validatorUtils.validate(schema, data);
};

module.exports.validateResetPasswordRequest = (data) => {
  const schema = Yup.object().shape({password: commonAuthSchema.password});

  return validatorUtils.validate(schema, data);
};

module.exports.validateUploadDocumentRequest = (data) => {
  const schema = Yup.object().shape({
    label: Yup.string().required('Label is required'),
  });
  return validatorUtils.validate(schema, data);
};

module.exports.validateDeleteDocumentParams = (data) => {
  const schema = Yup.object().shape({
    label: Yup.string().required('Label is required'),
  });
  return validatorUtils.validate(schema, data);
};

module.exports.validateUpdateProfileRequest = (user) => {
  const schema = roleSwiperSchema(user);

  return validatorUtils.validate(schema, user);
};

const roleSwiperSchema = (user) => {
  let schema;
  if (user.role === usersConstants.roles.driver.value) {
    schema = Yup.object().shape({
      role: Yup.string().oneOf(Object.keys(usersConstants.roles)),
      ...driverSchema,
      ...commonFields,
    });
  } else {
    schema = Yup.object().shape({
      role: Yup.string().oneOf(Object.keys(usersConstants.roles)),
      ...companySchema,
      ...commonFields,
    });
  }
  return schema;
};
