const Yup = require('yup');

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
  federalLicenseNo: Yup.string().required('Federal license number is required'),
  federalLicenseType: Yup.string().required(
    'Federal license number is required'
  ),
  stateLicenseNo: Yup.string().required('State license number is required'),
  stateLicenseType: Yup.string().required('State license number is required'),
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
};

exports.companySchema = {
  companyName: Yup.string().required('Company Name is required'),
  taxNumber: Yup.string().required('Tax number is required'),
  auditTechnique: Yup.string().required('CAAT is required'),
  companyDescription: Yup.string().required('Company description is required'),
  marginalCost: Yup.string(),
  deptOfTransport: Yup.string(),
  alphaCode: Yup.string(),
};

exports.commonFields = {
  contact: Yup.string()
    .required('Contact number is required')
    .matches(/^\d+$/, 'Contact number must contain only numbers'),
  reqForComments: Yup.string(),
  postalAddress: Yup.string().required('Postal address is required'),
  city: Yup.string().required('City is required'),
  country: Yup.string().required('Country is required'),
  postalCode: Yup.string().required('Postal code is required'),
};
