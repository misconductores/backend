const Yup = require('yup');
const {
  federalLicenseTypes,
  stateLicenseTypes,
} = require('../constants/usersConstants');

exports.driverSchema = {
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  dateOfBirth: Yup.date().test(
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
  gender: Yup.string(),
  licenseName: Yup.string().required('License name is required'),
  licenseCity: Yup.string().required('License city is required'),
  licenseCountry: Yup.string().required('License country is required'),
  federalLicenseNo: Yup.string()
    .max(15, 'Federal License number should be maximum 15 digits long')
    .required('Federal license number is required'),
  federalLicenseType: Yup.string()
    .oneOf(federalLicenseTypes, 'Please select a type')
    .required('Federal license number is required'),
  stateLicenseNo: Yup.string()
    .max(15, 'State License number should be maximum 15 digits long')
    .required('State license number is required'),
  stateLicenseType: Yup.string()
    .oneOf(stateLicenseTypes, 'Please select a type')
    .required('State license number is required'),
  experience: Yup.number().required('Experience is required'),
  handleEquipment: Yup.string().required('Handle equipment is required'),
  visaNumber: Yup.string().required('VISA number is required'),
  visaExpiry: Yup.string().required('VISA expiry is required'),
  fastNumber: Yup.string().required('FAST number is required'),
  fastExpiry: Yup.string().required('FAST expiry is required'),
  additionalDocumentName: Yup.string().required(
    'Additional document name is required'
  ),
  additionalDocumentId: Yup.string().required(
    'Additional document ID is required'
  ),
  driverStatus: Yup.string().required('Driver Status is required'),
};

exports.companySchema = {
  companyName: Yup.string().required('Company Name is required'),
  taxNumber: Yup.string().required('Tax number is required'),
  carrierCode: Yup.string()
    .max(11, 'CAAT number should be maximum 11 digits long')
    .required('CAAT is required'),
  companyDescription: Yup.string().required('Company description is required'),
  motorCarrier: Yup.string()
    .matches(/^\d+$/, 'Only digits are allowed')
    .max(8, 'MC number should be maximum 8 digits long'),
  deptOfTransport: Yup.string().max(
    12,
    'DOT number should be maximum 12 digits long'
  ),
  alphaCode: Yup.string()
    .matches(/^[A-Za-z]+$/, 'Only alphabets are allowed')
    .max(4, 'SCAC number should be maximum 4 digits long'),
};

exports.commonFields = {
  contact: Yup.string()
    .required('Contact number is required')
    .matches(/^\d+$/, 'Contact number must contain only numbers'),
  federalRegisterTax: Yup.string().max(
    13,
    'RFC number should be maximum 13 digits long'
  ),
  postalAddress: Yup.string().required('Postal address is required'),
  city: Yup.string().required('City is required'),
  country: Yup.string().required('Country is required'),
  postalCode: Yup.string().required('Postal code is required'),
};
