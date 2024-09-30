const Yup = require('yup');
const {validatorUtils} = require('../utils');

module.exports.validatePrepareSubscriptionReq = (data) => {
  const schema = Yup.object().shape({
    subscriptionPlanId: Yup.string().required(
      "Provider's subscription id is required"
    ),
  });
  return validatorUtils.validate(schema, data);
};
