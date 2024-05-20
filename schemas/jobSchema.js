const Yup = require('yup');
const {validatorUtils} = require('../utils');

const commonFields = {
  title: Yup.string().required('Job title is required'),
  experience: Yup.number().required('Experience is required'),
  location: Yup.string().required('Location is required'),
  description: Yup.string().required('Description is required'),
  responsibility: Yup.string().required('Responsibility detail is required'),
};

module.exports.validateJobCreateReq = (data) => {
  const schema = Yup.object().shape({
    ...commonFields,
  });
  return validatorUtils.validate(schema, data);
};

module.exports.validateJobListQueries = (data) => {
  const schema = Yup.object().shape({
    page: Yup.number()
      .typeError('Page number is required')
      .required('Page number is required'),
    limit: Yup.number()
      .typeError('Page limit is required')
      .required('Page limit is required'),
  });
  return validatorUtils.validate(schema, data);
};

module.exports.validatejobIdParams = (data) => {
  const schema = Yup.object().shape({
    id: Yup.string().required('Id is required'),
  });
  return validatorUtils.validate(schema, data);
};
