const sendEmail = require('../send');
const {
  defaultEmailName,
  defaultEmailAddress,
  sendGridVerifyUserTemplateId,
} = require('../../../values/contants/email');

module.exports = async ({user, verifyUrl}) => {
  const {email, firstName, lastName} = user;
  const name = `${firstName} ${lastName}`;

  const to = {email, name};
  const from = {email: defaultEmailAddress, name: defaultEmailName};
  const templateId = sendGridVerifyUserTemplateId;
  const dynamic_template_data = {name: firstName, verifyUrl};

  await sendEmail({to, from, templateId, dynamic_template_data});
};
