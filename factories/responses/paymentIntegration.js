const AppResponse = require('./AppResponse');

module.exports = class PaymentIntegrationResponsesFactory {
    static paymentAttemptSuccess({ paymentReference }) {
        return new AppResponse({
            message: 'Payment attempt successful',
            statusCode: 200,
            body: { paymentReference },
        });
    }

    static eventCallSuccessfully() {
        return new AppResponse({
            message: 'Event call successfully',
            statusCode: 200,
            body: {},
        });
    }
}