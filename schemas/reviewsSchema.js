const Yup = require('yup');
const {validatorUtils} = require('../utils');


module.exports.validateDriverDisconnectReq = (data) => {
  const schema = Yup.object().shape({
    companyId: Yup.string().required('Company Id is required'),
    driverId: Yup.string().required('Driver Id is required'),
    type: Yup.string().required('Review type is required'),
    description: Yup.string().required('Description is required'),
    communication: Yup.string().required('Communications answer is required'),
    obligationsAndDuties: Yup.string().required(
      'Obligations & Duties answer is required'
    ),
    significantProblems: Yup.string().required(
      'Significant problems answer is required'
    ),
    reasonToLeave: Yup.string().required('Reason to leave answer is required'),
    personalRelations: Yup.string().required(
      'Personal relations rating is required'
    ),
    trucks: Yup.string().required('Trucks rating is required'),
  });
  return validatorUtils.validate(schema, data);
};

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
}
