const Yup = require('yup');
const {validatorUtils} = require('../utils');

module.exports.validateSendDocsReq = (data) => {
  const schema = Yup.object().shape({
    requestedUserId: Yup.string().required('Requested user Id is required'),
  });
  return validatorUtils.validate(schema, data);
};
