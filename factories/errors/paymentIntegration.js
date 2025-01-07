const AppError = require('./AppError');
const AppResponse = require('../responses/AppResponse');

module.exports = class PaymentIntegrationErrorsFactory {
    static unhandledEventErr() {
        return new AppError({
            message: 'Unhandled Event',
            statusCode: 400,
        });
    }

    static webhookError() {
        return new AppResponse({
            message: 'Webhook error',
            statusCode: 500,
        });
    }
};