const Yup = require('yup');
const {validatorUtils} = require('../utils');

module.exports.validatePaginationParams = (data) => {
  const schema = Yup.object().shape({
    page: Yup.string().required('Page number is required'),
    limit: Yup.string().required('Page limit is required'),
  });
  return validatorUtils.validate(schema, data);
};
