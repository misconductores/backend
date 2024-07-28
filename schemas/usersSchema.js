const Yup = require('yup');

const {usersConstants} = require('../constants');
const {validatorUtils} = require('../utils');
const {
  driverSchema,
  commonFields,
  companySchema,
  updateDriverSchema,
} = require('./commonSchema');
const {
  driverDocumentNames,
  companyDocumentNames,
} = require('../constants/usersConstants');

const allowedRoles = Object.keys(usersConstants.roles).filter(
  (x) => x !== usersConstants.roles.admin.value
);

const commonAuthSchema = {
  email: Yup.string()
    .required('Email is required')
    .test('email', 'Invalid Email', (val) => {
      return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(val);
    }),
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
  let schema;
  if (data.role === usersConstants.roles.driver.value) {
    schema = Yup.object().shape({
      label: Yup.string()
        .oneOf(
          Object.values(driverDocumentNames).map((x) => x.value),
          'Only driver documents are required'
        )
        .required('Label is required'),
      role: Yup.string()
        .oneOf(allowedRoles, 'Only driver or company can upload document')
        .required('Role is required'),
    });
  } else {
    schema = Yup.object().shape({
      label: Yup.string()
        .oneOf(
          Object.values(companyDocumentNames).map((x) => x.value),
          'Only company documents are required'
        )
        .required('Label is required'),
      role: Yup.string()
        .oneOf(allowedRoles, 'Only driver or company can upload document')
        .required('Role is required'),
    });
  }
  return validatorUtils.validate(schema, data);
};

module.exports.validateDeleteDocumentParams = (data) => {
  const schema = Yup.object().shape({
    label: Yup.string().required('Label is required'),
  });
  return validatorUtils.validate(schema, data);
};

module.exports.validatePreRegisterDeleteDocumentParams = (data) => {
  const schema = Yup.object().shape({
    key: Yup.string().required('Document key is required'),
  });
  return validatorUtils.validate(schema, data);
};

module.exports.validatePostalCodeParams = (data) => {
  const schema = Yup.object().shape({
    postalCode: Yup.string().required('Postal code is required'),
  });
  return validatorUtils.validate(schema, data);
};

module.exports.validateUpdateProfileRequest = (user) => {
  const schema = updateProfileRoleSwiperSchema(user);

  return validatorUtils.validate(schema, user);
};

const roleSwiperSchema = (user) => {
  let schema;
  if (user.role === usersConstants.roles.driver.value) {
    schema = Yup.object().shape({
      ...commonAuthSchema,
      role: Yup.string().oneOf(Object.keys(usersConstants.roles)),
      ...driverSchema,
      ...commonFields,
    });
  } else {
    schema = Yup.object().shape({
      ...commonAuthSchema,
      role: Yup.string().oneOf(Object.keys(usersConstants.roles)),
      ...companySchema,
      ...commonFields,
    });
  }
  return schema;
};

const updateProfileRoleSwiperSchema = (user) => {
  let schema;
  if (user.role === usersConstants.roles.driver.value) {
    schema = Yup.object().shape({
      role: Yup.string().oneOf(Object.keys(usersConstants.roles)),
      ...updateDriverSchema,
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

module.exports.validateCheckEmailRequest = (data) => {
  const schema = Yup.object().shape({
    email: commonAuthSchema.email,
  });
  return validatorUtils.validate(schema, data);
};

module.exports.validateBlockUserReq = (data) => {
  const schema = Yup.object().shape({
    userId: Yup.string().required('User id is required'),
  });
  return validatorUtils.validate(schema, data);
};
