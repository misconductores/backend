const Yup = require('yup');
const {validatorUtils} = require('../utils');

module.exports.validateCreateOfferReq = (data) => {
  const schema = Yup.object().shape({
    driverId: Yup.string().required('Driver Id is required'),
    jobId: Yup.string().required('JobId Id is required'),
  });
  return validatorUtils.validate(schema, data);
};

module.exports.validateUpdateOfferParams = (data) => {
  const schema = Yup.object().shape({
    id: Yup.string().required('Offer Id is required'),
  });
  return validatorUtils.validate(schema, data);
};
