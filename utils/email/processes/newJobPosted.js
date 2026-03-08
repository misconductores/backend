const config = require('config');
const sendEmail = require('../send');
const {defaultEmailAddress} = require('../../../values/contants/email');

/**
 * Envía un email a un conductor notificándole sobre una nueva vacante
 * @param {Object} driver - Información del conductor
 * @param {Object} job - Información del trabajo
 * @param {Object} company - Información de la empresa
 */
module.exports = async function sendNewJobPostedEmail({driver, job, company}) {
  try {
    const to = driver.email;
    const from = defaultEmailAddress;
    
    // Template ID para notificaciones de nueva vacante
    const templateId = 'd-c4be8d374adc4b23b616cd21427f048a';

    const driverName = `${driver.firstName} ${driver.lastName}`;
    const domain = config.get('frontendURL');
    const jobUrl = `${domain}/jobs/${job._id}`;

    const dynamicTemplateData = {
      driverName: driverName,
      jobTitle: job.title,
      companyName: company.companyName,
      city: job.city,
      vehicleType: job.vehicleType,
      experience: job.experience?.join(', ') || 'No especificada',
      jobUrl: jobUrl,
    };

    await sendEmail({
      to,
      from,
      templateId,
      dynamic_template_data: dynamicTemplateData,
    });

    return {success: true};
  } catch (error) {
    console.error('Error sending new job posted email:', error);
    return {success: false, error};
  }
};
