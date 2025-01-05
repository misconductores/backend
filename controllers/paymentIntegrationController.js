const { PaymentIntegrationServices } = require('../services');
const { PaymentIntegrationResponsesFactory,
    PaymentIntegrationErrorsFactory,
    AuthErrors,
} = require('../factories');
const StripeUtils = require('../utils/stripeUtils');
const { stripeEvents } = require('../constants/usersConstants');

module.exports = class PaymentIntegrationController {
    static async paymentAttempt(req, res, next) {
        const userId = req.jwtToken.user.id;
        const { serviceId } = req.body;
        const { success, paymentReference, error } = await PaymentIntegrationServices.paymentAttempt({
            userId,
            serviceId
        });

        if (success) return next(PaymentIntegrationResponsesFactory.paymentAttemptSuccess({ paymentReference }));
        if (error) throw error;
    }

    static async webhook(req, res, next) {
        const { success, event } = await StripeUtils.verifyWebhookSignature({ req });

        if (!success) return next(AuthErrors.unauthorized());

        try {
            switch (event.type) {
                case stripeEvents.paymentSuccess.value: {
                    const intent = event.data.object;
                    const {success, error} = await PaymentIntegrationServices.updatePaymentAttempt(intent);
                    if (!success) throw error;
    
                    break;
                }
                default:
                    return next(PaymentIntegrationErrorsFactory.unhandledEventErr());
            }
            return next(PaymentIntegrationResponsesFactory.eventCallSuccessfully());
        } catch (error) {
            console.error('Critical error in webhook: ', error.message);
            return next(PaymentIntegrationErrorsFactory.webhookError());
        }
    }
}