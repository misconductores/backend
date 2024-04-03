const Yup = require('yup');

const {usersConstants} = require('../constants');
const {validatorUtils} = require('../utils');

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
  const schema = Yup.object().shape({
    ...commonAuthSchema,
    firstName: Yup.string().when('role', {
      is: (val) => val === usersConstants.roles.driver.value,
      then: () => Yup.string().required('First name is required'),
      otherwise: () => Yup.string(),
    }),
    lastName: Yup.string().when('role', {
      is: (val) => val === usersConstants.roles.driver.value,
      then: () => Yup.string().required('Last name is required'),
      otherwise: () => Yup.string(),
    }),
    role: Yup.string().oneOf(Object.keys(usersConstants.roles)),
    companyName: Yup.string().when('role', {
      is: (val) => val === usersConstants.roles.company.value,
      then: () => Yup.string().required('Company name is required'),
      otherwise: () => Yup.string(),
    }),
    licenseType: Yup.string().when('role', {
      is: (val) => val === usersConstants.roles.driver.value,
      then: () => Yup.string().required('License Type is required'),
      otherwise: () => Yup.string(),
    }),
  });

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
  const schema = Yup.object().shape({
    firstName: Yup.string().when('role', {
      is: (val) => val === usersConstants.roles.driver.value,
      then: () => Yup.string().required('First name is required'),
      otherwise: () => Yup.string(),
    }),
    lastName: Yup.string().when('role', {
      is: (val) => val === usersConstants.roles.driver.value,
      then: () => Yup.string().required('Last name is required'),
      otherwise: () => Yup.string(),
    }),
    companyName: Yup.string().when('role', {
      is: (val) => val === usersConstants.roles.company.value,
      then: () => Yup.string().required('Company name is required'),
      otherwise: () => Yup.string(),
    }),
    licenseType: Yup.string().when('role', {
      is: (val) => val === usersConstants.roles.driver.value,
      then: () => Yup.string().required('License Type is required'),
      otherwise: () => Yup.string(),
    }),
  });

  return validatorUtils.validate(schema, user);
};
