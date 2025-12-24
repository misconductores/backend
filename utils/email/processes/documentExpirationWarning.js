const sendEmail = require('../send');
const {
  defaultEmailName,
  defaultEmailAddress,
  sendGridDocumentExpirationWarningTemplateId,
} = require('../../../values/contants/email');
const {usersConstants} = require('../../../constants');

module.exports = async ({user, documents}) => {
  const {email, firstName, lastName, companyName, role} = user;

  const name =
    role === usersConstants.roles.driver.value && firstName && lastName
      ? `${firstName} ${lastName}`.trim()
      : companyName || firstName || lastName || 'Usuario';

  const to = {email, name};
  const from = {email: defaultEmailAddress, name: defaultEmailName};
  const templateId = sendGridDocumentExpirationWarningTemplateId;
  const dynamic_template_data = {
    name,
    documents,
  };

  await sendEmail({to, from, templateId, dynamic_template_data});
};
