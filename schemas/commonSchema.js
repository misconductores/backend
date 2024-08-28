const Yup = require('yup');
const {
  federalLicenseTypes,
  stateLicenseTypes,
  genderOptions,
  driverStatuses,
} = require('../constants/usersConstants');

const commonDriverFields = {
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
  gender: Yup.string()
    .oneOf(genderOptions, 'Please select a gender')
    .required('Gender is required'),
};

const commonExpDocSchema = {
  experience: Yup.string(),
  handleEquipment: Yup.array(),
  vehicleType: Yup.string(),
  visaNumber: Yup.string(),
  visaExpiry: Yup.string(),
  fastNumber: Yup.string(),
  fastExpiry: Yup.string(),
  additionalDocuments: Yup.array().of(
    Yup.object().shape({
      additionalDocumentName: Yup.string(),
      additionalDocumentId: Yup.string().when('additionalDocumentName', {
        is: (val) => val !== '',
        then: () => Yup.string().required('Document Id is required'),
        otherwise: () => Yup.string(),
      }),
    })
  ),
};

exports.driverSchema = {
  ...commonDriverFields,
  licenseName: Yup.string(),
  licenseCity: Yup.string(),
  licenseCountry: Yup.string(),
  federalLicenseNo: Yup.string(),
  federalLicenseType: Yup.string(),
  stateLicenseNo: Yup.string(),
  stateLicenseType: Yup.string(),
  ...commonExpDocSchema,
  driverStatus: Yup.string()
    .oneOf(Object.keys(driverStatuses, 'Please select driver status'))
    .required('Driver Status is required'),
};

exports.updateDriverSchema = {
  ...commonDriverFields,
  licenseName: Yup.string(),
  licenseCity: Yup.string(),
  licenseCountry: Yup.string(),
  federalLicenses: Yup.array().of(
    Yup.object().shape({
      federalLicenseNo: Yup.string().max(
        15,
        'Federal License number should be maximum 15 digits long'
      ),
      federalLicenseType: Yup.string().when('federalLicenseNo', {
        is: (val) => val !== '',
        then: () => Yup.string().required('Federal license type is required'),
        otherwise: () => Yup.string(),
      }),
      expiryDate: Yup.string().when('federalLicenseNo', {
        is: (val) => val !== '',
        then: () => Yup.string().required('Expiry date is required'),
        otherwise: () => Yup.string(),
      }),
    })
  ),
  stateLicenses: Yup.array().of(
    Yup.object().shape({
      stateLicenseNo: Yup.string().max(
        15,
        'State License number should be maximum 15 digits long'
      ),
      stateLicenseType: Yup.string().when('stateLicenseNo', {
        is: (val) => val !== '',
        then: () => Yup.string().required('State license type is required'),
        otherwise: () => Yup.string(),
      }),
      expiryDate: Yup.string().when('stateLicenseNo', {
        is: (val) => val !== '',
        then: () => Yup.string().required('Expiry date is required'),
        otherwise: () => Yup.string(),
      }),
    })
  ),
  ...commonExpDocSchema,
};

exports.companySchema = {
  companyName: Yup.string().required('Company Name is required'),
  taxNumber: Yup.string().required('Tax number is required'),
  carrierCode: Yup.string()
    .max(11, 'CAAT number should be maximum 11 digits long')
    .required('CAAT is required'),
  companyDescription: Yup.string().required('Company description is required'),
  motorCarrier: Yup.string().max(
    8,
    'MC number should be maximum 8 digits long'
  ),
  deptOfTransport: Yup.string().max(
    12,
    'DOT number should be maximum 12 digits long'
  ),
  alphaCode: Yup.string().max(4, 'SCAC number should be maximum 4 digits long'),
};

exports.commonFields = {
  contact: Yup.string()
    .required('Contact number is required')
    .matches(/^\+\d+$/, 'Contact number must be in digits with country code')
    .min(10, 'Invalid contact number')
    .max(15, 'Invalid contact number'),
  federalRegisterTax: Yup.string().max(
    13,
    'RFC number should be maximum 13 digits long'
  ),
  postalAddress: Yup.string(),
  area: Yup.string(),
  city: Yup.string(),
  country: Yup.string(),
  postalCode: Yup.string(),
};
