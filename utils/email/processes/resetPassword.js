const sendEmail = require('../send');
const {
  defaultEmailName,
  defaultEmailAddress,
  sendGridResetLoginTemplateId,
} = require('../../../values/contants/email');
const {usersConstants} = require('../../../constants');

module.exports = async ({user, resetUrl}) => {
  const {email, firstName, lastName, companyName, role} = user;

  let name;
  if (role === usersConstants.roles.driver.value) {
    name = `${firstName} ${lastName}`;
  } else {
    name = companyName;
  }

  const to = {email, name};
  const from = {email: defaultEmailAddress, name: defaultEmailName};

  // this dummy id will replaced with original one later
  const templateId = sendGridResetLoginTemplateId;
  const dynamic_template_data = {name: name, resetUrl};

  await sendEmail({to, from, templateId, dynamic_template_data});
};
