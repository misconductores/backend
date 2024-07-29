const Yup = require('yup');
const {validatorUtils} = require('../utils');

module.exports.validateSendDocsReq = (data) => {
  const schema = Yup.object().shape({
    driverId: Yup.string().required('Driver Id is required'),
    companyId: Yup.string().required('Company Id is required'),
  });
  return validatorUtils.validate(schema, data);
};
