const sendEmail = require('../send');
const {
  defaultEmailName,
  defaultEmailAddress,
  sendGridBackCheckCompleteTemplateId,
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

  const templateId = sendGridBackCheckCompleteTemplateId;
  const dynamic_template_data = {name: name, verifyUrl};

  await sendEmail({to, from, templateId, dynamic_template_data});
};
