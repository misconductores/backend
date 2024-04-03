const sendEmail = require('../send');
const {
  defaultEmailName,
  defaultEmailAddress,
  sendGridResetLoginTemplateId,
  sendGridResetDummyId,
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
  // this email and name will replaced when original sendGrid access will granted
  const from = {email: 'mitodo.oficios@gmail.com', name: 'Desol Int.'};

  // this dummy id will replaced with original one later
  const templateId = sendGridResetDummyId;
  const dynamic_template_data = {name: name, resetUrl};

  await sendEmail({to, from, templateId, dynamic_template_data});
};
