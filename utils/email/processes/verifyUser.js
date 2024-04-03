const sendEmail = require('../send');
const {
  defaultEmailName,
  defaultEmailAddress,
  sendGridDummyTemplateId,
} = require('../../../values/contants/email');
const {usersConstants} = require('../../../constants');
const {
  SENDGRID_EMAIL,
  SENDGRID_EMAIL_NAME,
} = require('../../../constants/usersConstants');

module.exports = async ({user, verifyUrl}) => {
  const {email, firstName, lastName, companyName, role} = user;

  let name;
  if (role === usersConstants.roles.driver.value) {
    name = `${firstName} ${lastName}`;
  } else {
    name = companyName;
  }

  const to = {email, name};

  const from = {email: SENDGRID_EMAIL, name: SENDGRID_EMAIL_NAME};

  // currently i am using dummy sendGrid template for user verification
  const templateId = sendGridDummyTemplateId;
  const dynamic_template_data = {name: name, verifyUrl};

  await sendEmail({to, from, templateId, dynamic_template_data});
};
