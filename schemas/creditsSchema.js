const Yup = require('yup');
const { creditPackages } = require('../constants/usersConstants');
const { validatorUtils } = require('../utils');

const validPriceIds = Object.values(creditPackages).map(pkg => pkg.value);

module.exports.validateCreateCheckoutSessionReq = (data) => {
  const schema = Yup.object().shape({
    packageType: Yup.string()
      .oneOf(['basicPackage', 'premiumPackage'], 'Package type must be either basicPackage or premiumPackage')
      .required('Package type is required'),
    priceId: Yup.string()
      .oneOf(validPriceIds, 'Invalid price ID provided')
      .required('Price ID is required')
  });

  return validatorUtils.validate(schema, data);
};
