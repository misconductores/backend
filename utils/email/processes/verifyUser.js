const sendEmail = require('../send');
const {
  defaultEmailName,
  defaultEmailAddress,
  sendGridVerifyUserTemplateId,
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

  const from = {email: defaultEmailAddress, name: defaultEmailName};

  // currently i am using dummy sendGrid template for user verification
  const templateId = sendGridVerifyUserTemplateId;
  const dynamic_template_data = {name: name, verifyUrl};

  await sendEmail({to, from, templateId, dynamic_template_data});
};
