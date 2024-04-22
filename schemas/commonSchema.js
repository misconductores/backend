const Yup = require('yup');
const {usersConstants} = require('../constants');

const driverSchema = {
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
  dateOfBirth: Yup.date().when('role', {
    is: (val) => val === usersConstants.roles.driver.value,
    then: () =>
      Yup.date().test(
        'is-18-or-older',
        'You must be at least 18 years old',
        (value) => {
          const today = new Date();
          const birthDate = new Date(value);
          const cutoffDate = new Date(
            today.getFullYear() - 18,
            today.getMonth(),
            today.getDate()
          );
          return birthDate <= cutoffDate;
        }
      ),
    otherwise: () => Yup.date(),
  }),
  gender: Yup.string(),
  licenseName: Yup.string().when('role', {
    is: (val) => val === usersConstants.roles.driver.value,
    then: () => Yup.string().required('License name is required'),
    otherwise: () => Yup.string(),
  }),
  licenseCity: Yup.string().when('role', {
    is: (val) => val === usersConstants.roles.driver.value,
    then: () => Yup.string().required('License city is required'),
    otherwise: () => Yup.string(),
  }),
  licenseCountry: Yup.string().when('role', {
    is: (val) => val === usersConstants.roles.driver.value,
    then: () => Yup.string().required('License country is required'),
    otherwise: () => Yup.string(),
  }),
  federalLicenseNo: Yup.string().when('role', {
    is: (val) => val === usersConstants.roles.driver.value,
    then: () => Yup.string().required('Federal license number is required'),
    otherwise: () => Yup.string(),
  }),
  federalLicenseType: Yup.string().when('role', {
    is: (val) => val === usersConstants.roles.driver.value,
    then: () => Yup.string().required('Federal license number is required'),
    otherwise: () => Yup.string(),
  }),
  stateLicenseNo: Yup.string().when('role', {
    is: (val) => val === usersConstants.roles.driver.value,
    then: () => Yup.string().required('State license number is required'),
    otherwise: () => Yup.string(),
  }),
  stateLicenseType: Yup.string().when('role', {
    is: (val) => val === usersConstants.roles.driver.value,
    then: () => Yup.string().required('State license number is required'),
    otherwise: () => Yup.string(),
  }),
  experience: Yup.number().when('role', {
    is: (val) => val === usersConstants.roles.driver.value,
    then: () => Yup.string().required('Experience is required'),
    otherwise: () => Yup.string(),
  }),
  handleEquipment: Yup.string().when('role', {
    is: (val) => val === usersConstants.roles.driver.value,
    then: () => Yup.string().required('Handle equipment is required'),
    otherwise: () => Yup.string(),
  }),
  visaNumber: Yup.string().when('role', {
    is: (val) => val === usersConstants.roles.driver.value,
    then: () => Yup.string().required('VISA number is required'),
    otherwise: () => Yup.string(),
  }),
  visaExpiry: Yup.string().when('role', {
    is: (val) => val === usersConstants.roles.driver.value,
    then: () => Yup.string().required('VISA expiry is required'),
    otherwise: () => Yup.string(),
  }),
  fastNumber: Yup.string().when('role', {
    is: (val) => val === usersConstants.roles.driver.value,
    then: () => Yup.string().required('FAST number is required'),
    otherwise: () => Yup.string(),
  }),
  fastExpiry: Yup.string().when('role', {
    is: (val) => val === usersConstants.roles.driver.value,
    then: () => Yup.string().required('FAST expiry is required'),
    otherwise: () => Yup.string(),
  }),
  additionalDocumentName: Yup.string().when('role', {
    is: (val) => val === usersConstants.roles.driver.value,
    then: () => Yup.string().required('Additional document name is required'),
    otherwise: () => Yup.string(),
  }),
  additionalDocumentId: Yup.string().when('role', {
    is: (val) => val === usersConstants.roles.driver.value,
    then: () => Yup.string().required('Additional document ID is required'),
    otherwise: () => Yup.string(),
  }),
};

const companySchema = {
  companyName: Yup.string().when('role', {
    is: (val) => val === usersConstants.roles.company.value,
    then: () => Yup.string().required('Company Name is required'),
    otherwise: () => Yup.string(),
  }),
  taxNumber: Yup.string().when('role', {
    is: (val) => val === usersConstants.roles.company.value,
    then: () => Yup.string().required('Tax number is required'),
    otherwise: () => Yup.string(),
  }),
  auditTechnique: Yup.string().when('role', {
    is: (val) => val === usersConstants.roles.company.value,
    then: () => Yup.string().required('CAAT is required'),
    otherwise: () => Yup.string(),
  }),
  companyDescription: Yup.string().when('role', {
    is: (val) => val === usersConstants.roles.company.value,
    then: () => Yup.string().required('Company description is required'),
    otherwise: () => Yup.string(),
  }),
  marginalCost: Yup.string(),
  deptOfTransport: Yup.string(),
  alphaCode: Yup.string(),
};

const commonFields = {
  contact: Yup.string()
    .required('Contact number is required')
    .matches(/^\d+$/, 'Contact number must contain only numbers'),
  reqForComments: Yup.string(),
  postalAddress: Yup.string().required('Postal address is required'),
  city: Yup.string().required('City is required'),
  country: Yup.string().required('Country is required'),
  postalCode: Yup.string().required('Postal code is required'),
};

exports.commonUserSchema = {
  ...driverSchema,
  ...companySchema,
  ...commonFields,
};
