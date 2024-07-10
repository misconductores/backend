const Yup = require('yup');
const {validatorUtils} = require('../utils');
const {
  vehicleTypes,
  stateLicenseTypes,
  federalLicenseTypes,
  equipmentTypes,
  experienceTypes,
} = require('../constants/usersConstants');

const equipments = Object.values(equipmentTypes).map((option) => option.value);
const experiences = Object.values(experienceTypes).map(
  (option) => option.value
);

const commonFields = {
  title: Yup.string().required('Job title is required'),
  experience: Yup.array()
    .of(Yup.string().oneOf(experiences))
    .min(1, 'Please select at least 1 experience type'),
  vehicleType: Yup.string().required('Vehicle type is required'),
  handledEquipment: Yup.array().when('vehicleType', {
    is: (val) => val === vehicleTypes.fifthWheeler.value,
    then: () =>
      Yup.array()
        .of(Yup.string().oneOf(equipments))
        .min(1, 'Please select at least 1 equipment type'),
    otherwise: () => Yup.array(),
  }),
  stateLicenseTypes: Yup.array().of(Yup.string().oneOf(stateLicenseTypes)),
  federalLicenseTypes: Yup.array().of(Yup.string().oneOf(federalLicenseTypes)),
  city: Yup.string().required('City is required'),
  postalCode: Yup.string().required('Postal code is required'),
  description: Yup.string().required('Description is required'),
  responsibility: Yup.string().required('Responsibility detail is required'),
};

module.exports.validateJobReq = (data) => {
  const schema = Yup.object()
    .shape({
      ...commonFields,
    })
    .test('at-least-one-license-type', function (value) {
      const {stateLicenseTypes, federalLicenseTypes} = value;
      if (
        (!stateLicenseTypes || stateLicenseTypes.length === 0) &&
        (!federalLicenseTypes || federalLicenseTypes.length === 0)
      ) {
        return this.createError({
          path: 'stateLicenseTypes',
          message: 'Please select at least one license type (state or federal)',
        });
      }
      return true;
    });
  return validatorUtils.validate(schema, data);
};

module.exports.validateJobIdParams = (data) => {
  const schema = Yup.object().shape({
    id: Yup.string().required('Id is required'),
  });
  return validatorUtils.validate(schema, data);
};
