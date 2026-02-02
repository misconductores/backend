const sendEmail = require('../send');
const {
  defaultEmailName,
  defaultEmailAddress,
  sendGridDocumentExpirationWarningTemplateId,
} = require('../../../values/contants/email');
const {usersConstants} = require('../../../constants');
const {getDocumentPaymentLink} = require('../../helpers/documentPaymentLink');

module.exports = async ({user, notification}) => {
  const {email, firstName, lastName, companyName, role} = user;

  const composedName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const driverFullName =
    role === usersConstants.roles.driver.value
      ? composedName || 'Usuario'
      : companyName || composedName || 'Usuario';

  // Obtener el paymentLink para el documento
  const paymentUrl = await getDocumentPaymentLink(notification.documentName);

  const to = {email, name: driverFullName};
  const from = {email: defaultEmailAddress, name: defaultEmailName};
  const templateId = sendGridDocumentExpirationWarningTemplateId;
  const dynamic_template_data = {
    documentName: notification.documentName,
    driverFullName,
    expirationDate: notification.expirationDate,
    daysToExpire: notification.daysToExpire,
    paymentUrl,
  };

  await sendEmail({to, from, templateId, dynamic_template_data});
};
