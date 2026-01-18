const sendEmail = require('../send');
const {
  defaultEmailName,
  defaultEmailAddress,
  sendGridDocumentExpiredTemplateId,
} = require('../../../values/contants/email');
const {usersConstants} = require('../../../constants');

module.exports = async ({user, notification}) => {
  const {email, firstName, lastName, companyName, role} = user;

  const composedName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const driverFullName =
    role === usersConstants.roles.driver.value
      ? composedName || 'Usuario'
      : companyName || composedName || 'Usuario';

  const to = {email, name: driverFullName};
  const from = {email: defaultEmailAddress, name: defaultEmailName};
  const templateId = sendGridDocumentExpiredTemplateId;
  const dynamic_template_data = {
    documentName: notification.documentName,
    driverFullName,
    expirationDate: notification.expirationDate,
    daysToExpire: notification.daysToExpire,
  };

  await sendEmail({to, from, templateId, dynamic_template_data});
};
