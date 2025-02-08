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
        const { success, event } = await StripeUtils.verifyServicePaymentWebhookSignature({ req });

        if (!success) return next(AuthErrors.unauthorized());

        try {
            switch (event.type) {
                case stripeEvents.checkoutSessionCompleted.value: {
                    const session = event.data.object;
                    const paymentIntentId = session.payment_intent;
                    const paymentIntent = await StripeUtils.getPaymentIntent({ paymentIntentId });
                    if (paymentIntent.status == 'succeeded') {
                        const clientReferenceId = session.client_reference_id;
                        const { success, error } = await PaymentIntegrationServices.updatePaymentAttempt(clientReferenceId, paymentIntent);
                        if (!success) throw error;
                    }

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