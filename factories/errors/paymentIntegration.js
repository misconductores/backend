const AppError = require('./AppError');

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