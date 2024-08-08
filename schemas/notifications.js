const Yup = require('yup');
const {validatorUtils} = require('../utils');

module.exports.validateUpdateUnReadNotificationsReq = (data) => {
  const schema = Yup.object().shape({
    notificationIds: Yup.array(Yup.string().required()).required(
      'Notification Ids are required'
    ),
  });
  return validatorUtils.validate(schema, data);
};
