const sendEmail = require('../send');
const {
  defaultEmailName,
  defaultEmailAddress,
  sendGridResetLoginTemplateId,
} = require('../../../values/contants/email');

module.exports = async ({user, resetUrl}) => {
  const {email, firstName, lastName} = user;
  const name = `${firstName} ${lastName}`;

  const to = {email, name};
  const from = {email: defaultEmailAddress, name: defaultEmailName};
  const templateId = sendGridResetLoginTemplateId;
  const dynamic_template_data = {name: firstName, resetUrl};

  await sendEmail({to, from, templateId, dynamic_template_data});
};
