const Yup = require('yup');
const {validatorUtils} = require('../utils');

const commonFields = {
  title: Yup.string().required('Job title is required'),
  experience: Yup.number().required('Experience is required'),
  location: Yup.string().required('Location is required'),
  description: Yup.string().required('Description is required'),
  responsibility: Yup.string().required('Responsibility detail is required'),
};

module.exports.validateJobReq = (data) => {
  const schema = Yup.object().shape({
    ...commonFields,
  });
  return validatorUtils.validate(schema, data);
};

module.exports.validateJobIdParams = (data) => {
  const schema = Yup.object().shape({
    id: Yup.string().required('Id is required'),
  });
  return validatorUtils.validate(schema, data);
};
