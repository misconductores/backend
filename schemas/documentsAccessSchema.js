const Yup = require('yup');
const {validatorUtils} = require('../utils');
const {statusTypes} = require('../constants/usersConstants');

module.exports.validateSendDocsReq = (data) => {
  const schema = Yup.object().shape({
    requestedUserId: Yup.string().required('Requested user Id is required'),
  });
  return validatorUtils.validate(schema, data);
};

module.exports.validateGetCompanyDocsRequests = (data) => {
  const schema = Yup.object().shape({
    page: Yup.string().required('Page number is required'),
    limit: Yup.string().required('Page limit is required'),
    status: Yup.string()
      .oneOf(
        [
          statusTypes.accepted.value,
          statusTypes.rejected.value,
          statusTypes.pending.value,
          statusTypes.expired.value,
        ],
        'Invalid Status'
      )
      .required('Status is required'),
  });
  return validatorUtils.validate(schema, data);
};

module.exports.validateGetDriverDocsRequests = (data) => {
  const schema = Yup.object().shape({
    page: Yup.string().required('Page number is required'),
    limit: Yup.string().required('Page limit is required'),
    status: Yup.string()
      .oneOf(
        [
          statusTypes.accepted.value,
          statusTypes.pending.value,
          statusTypes.rejected.value,
          statusTypes.expired.value,
        ],
        'Invalid Status'
      )
      .required('Status is required'),
  });
  return validatorUtils.validate(schema, data);
};

module.exports.validateGetRequestedDocsRequests = (data) => {
  const schema = Yup.object().shape({
    userId: Yup.string().required('UserId is required'),
  });
  return validatorUtils.validate(schema, data);
};

module.exports.validateUpdateDocsRequestStatus = (data) => {
  const schema = Yup.object().shape({
    status: Yup.string()
      .oneOf(
        [
          statusTypes.accepted.value,
          statusTypes.rejected.value,
          statusTypes.expired.value,
        ],
        'Invalid Status'
      )
      .required('Status is required'),
  });
  return validatorUtils.validate(schema, data);
};
