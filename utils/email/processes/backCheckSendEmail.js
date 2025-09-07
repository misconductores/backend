const sendEmail = require('../send');
const {
  defaultEmailName,
  defaultEmailAddress,
  sendGridBackCheckReportTemplateId,
} = require('../../../values/contants/email');
const {usersConstants} = require('../../../constants');

const fs = require('fs');
const path = require('path');

module.exports = async ({user, verifyUrl, attachmentPath, pdfBase64, fileName}) => {
  console.log('--- [backCheckSendEmail] INICIO ---');
  console.log('user:', user);
  console.log('verifyUrl:', verifyUrl);
  console.log('attachmentPath:', attachmentPath);
  console.log('pdfBase64:', pdfBase64 ? pdfBase64.slice(0, 100) : 'undefined');
  console.log('fileName:', fileName);

  const {firstName, lastName, companyName, role} = user;

  let name;
  if (role === usersConstants.roles.driver.value) {
    name = `${firstName} ${lastName}`;
  } else {
    name = companyName;
  }
  const to = {email, name};
  const from = {email: defaultEmailAddress, name: defaultEmailName};
  const templateId = sendGridBackCheckReportTemplateId;
  const dynamic_template_data = {name: name, verifyUrl};

  let attachments = undefined;
  if (pdfBase64 && fileName) {
    console.log('[backCheckSendEmail] Adjuntando PDF base64 recibido desde frontend');
    console.log('[backCheckSendEmail] pdfBase64 inicio:', pdfBase64 ? pdfBase64.slice(0, 100) : 'undefined');
    console.log('[backCheckSendEmail] pdfBase64 longitud:', pdfBase64 ? pdfBase64.length : 0);
    attachments = [
      {
        content: pdfBase64,
        filename: fileName,
        type: 'application/pdf',
        disposition: 'attachment',
      },
    ];
  } else if (attachmentPath) {
    try {
      const filePath = path.resolve(attachmentPath);
      const fileContent = fs.readFileSync(filePath);
      attachments = [
        {
          content: fileContent.toString('base64'),
          filename: path.basename(filePath),
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ];
      console.log('[backCheckSendEmail] Adjuntando PDF leído desde disco:', filePath);
    } catch (err) {
      console.error('[backCheckSendEmail] Error leyendo archivo adjunto:', err);
    }
  } else {
    console.log('[backCheckSendEmail] No se adjuntó ningún archivo PDF');
  }

  console.log('[backCheckSendEmail] Enviando correo a:', to.email);
  console.log('[backCheckSendEmail] Nombre:', name);
  console.log('[backCheckSendEmail] Adjuntos:', attachments ? attachments.length : 0);
  try {
    await sendEmail({to, from, templateId, dynamic_template_data, attachments});
    console.log('[backCheckSendEmail] Correo enviado correctamente');
  } catch (err) {
    console.error('[backCheckSendEmail] Error al enviar correo:', err);
    throw err;
  }
  console.log('--- [backCheckSendEmail] FIN ---');
};
