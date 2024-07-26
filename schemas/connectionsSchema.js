const Yup = require('yup');
const {validatorUtils} = require('../utils');
const {connectionStatuses} = require('../constants/usersConstants');

const statusValues = Object.values(connectionStatuses).map(
  (status) => status.value
);

module.exports.validateGetCompanyDriversReq = (data) => {
  const schema = Yup.object().shape({
    page: Yup.string().required('Page number is required'),
    limit: Yup.string().required('Page limit is required'),
    status: Yup.string()
      .oneOf(statusValues, 'Invalid Status')
      .required('Connection active status is required'),
  });
  return validatorUtils.validate(schema, data);
};
