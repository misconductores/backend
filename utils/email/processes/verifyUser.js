const sendEmail = require('../send');
const {
  defaultEmailName,
  defaultEmailAddress,
  sendGridDummyTemplateId,
} = require('../../../values/contants/email');
const {usersConstants} = require('../../../constants');

module.exports = async ({user, verifyUrl}) => {
  const {email, firstName, lastName, companyName, role} = user;

  let name;
  if (role === usersConstants.roles.driver.value) {
    name = `${firstName} ${lastName}`;
  } else {
    name = companyName;
  }

  const to = {email, name};

  // this email and name will replaced when original sendGrid access will granted
  const from = {email: 'hamza.siddique@desolint.com', name: 'Desol Int.'};

  // currently i am using dummy sendGrid template for user verification
  const templateId = sendGridDummyTemplateId;
  const dynamic_template_data = {name: name, verifyUrl};

  await sendEmail({to, from, templateId, dynamic_template_data});
};
