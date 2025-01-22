const { v4: uuidv4 } = require('uuid');
const PaymentAttemptModel = require('../models/PaymentAttemptModel');
const UsersModel = require('../models/UsersModel');
const sendEmail = require('../utils/email/send');
const {
    defaultEmailAddress,
    sendGridCecati144InscriptionPaymentTemplateId,
} = require('../values/contants/email');
const ServiceModel = require('../models/ServiceModel');

module.exports = class PaymentIntegrationServices {
    static async paymentAttempt({ userId, serviceId }) {
        try {
            const paymentReference = uuidv4();
            const paymentAttempt = await PaymentAttemptModel.create({ paymentReference, userId, serviceId });

            if (!paymentAttempt) {
                throw new Error('Payment attempt creation failed');
            }

            return { success: true, paymentReference };
        } catch (error) {
            console.error('Error during payment attempt creation:', error);
            return { success: false, error: error.message };
        }
    }

    static async updatePaymentAttempt(clientReferenceId, intent) {
        try {
            const updatedPaymentAttempt = await PaymentAttemptModel.findOneAndUpdate(
                { paymentReference: clientReferenceId },
                { $set: { intent: intent } },
                { new: true, upsert: false }
            );

            if (!updatedPaymentAttempt) {
                console.error('Payment attempt update failed:', intent.id);
                throw new Error('Payment attempt update failed');
            }

            const driver = await UsersModel.findById(updatedPaymentAttempt.userId);
            if (!driver) {
                throw new Error('Driver not found');
            }

            const firstName = driver.firstName;
            const lastName = driver.lastName;
            const email = driver.email;
            const contact = driver.contact;
            const age = driver.age;

            const service = await ServiceModel.findById(updatedPaymentAttempt.serviceId);

            if (!service) {
                throw new Error('Service not found');
            }

            const to = service.email;
            const from = defaultEmailAddress;
            const templateId = service.emailTemplateId;
            const driverFullName = `${firstName} ${lastName}`;
            const dynamicTemplateData = {
                "name": driverFullName,
                "cellPhone": contact,
                "email": email,
                "age": age
            };

            sendEmail({ to, from, templateId, "dynamic_template_data": dynamicTemplateData });
            
            const customerDynamicTemplateData = {
                "name": driverFullName
            };

            const customerDynamicTemplateId = service.customerEmailTemplateId;

            sendEmail({ "to": email, from, "templateId": customerDynamicTemplateId, "dynamic_template_data": customerDynamicTemplateData });

            return { success: true };
        } catch (error) {
            console.error('Error during payment attempt update:', error);
            return { success: false, error: error.message };
        }

    }

};