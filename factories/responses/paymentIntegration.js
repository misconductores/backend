const AppResponse = require('./AppResponse');

module.exports = class PaymentIntegrationResponsesFactory {
    static paymentAttemptSuccess({ paymentReference, checkoutUrl, packageInfo }) {
        return new AppResponse({
            message: 'Payment attempt successful',
            statusCode: 200,
            body: { 
                paymentReference, 
                checkoutUrl, 
                packageInfo 
            },
        });
    }

    static eventCallSuccessfully(data = {}) {
        return new AppResponse({
            message: 'Event call successfully',
            statusCode: 200,
            body: data,
        });
    }
}