const Yup = require('yup');
const {validatorUtils} = require('../utils');

module.exports.validateCompanyDisconnectReq = (data) => {
  const schema = Yup.object().shape({
    companyId: Yup.string().required('Company Id is required'),
    driverId: Yup.string().required('Driver Id is required'),
    type: Yup.string().required('Review type is required'),
    description: Yup.string().required('Description is required'),
    careUnit: Yup.string().required('Care unit rating is required'),
    cleaningUnit: Yup.string().required('Cleaning unit rating is required'),
    punctualityUnit: Yup.string().required(
      'Punctuality unit rating is required'
    ),
    performance: Yup.string().required('Performance rating is required'),
  });
  return validatorUtils.validate(schema, data);
};
