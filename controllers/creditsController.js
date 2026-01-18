const { CreditsServices } = require('../services');
const { 
  PaymentIntegrationResponsesFactory,
  PaymentIntegrationErrorsFactory,
  AuthErrors 
} = require('../factories');
const StripeUtils = require('../utils/stripeUtils');
const { stripeEvents } = require('../constants/usersConstants');

module.exports = class CreditsController {
  static async getPackages(req, res, next) {
    try {
      const result = await CreditsServices.getAvailablePackages();

      if (!result.success) {
        throw new Error(result.error);
      }

      return next(PaymentIntegrationResponsesFactory.eventCallSuccessfully({
        packages: result.packages
      }));

    } catch (error) {
      console.error(' Error getting packages:', error);
      throw error;
    }
  }
//luego elimino mis console porque necesito verificar
  static async createCheckoutSession(req, res, next) {
    try {
      console.log('CREDITS CONTROLLER - createCheckoutSession called');
      console.log('req.body:', JSON.stringify(req.body, null, 2));
      console.log(' req.jwtToken:', req.jwtToken ? 'exists' : 'missing');
      
      const userId = req.jwtToken.user.id;
      const { packageType, priceId } = req.body;

      console.log(' Creating credits checkout session for user:', userId);
      console.log(' Package type:', packageType);
      console.log(' Price ID:', priceId);

      const result = await CreditsServices.createCheckoutSession({
        userId,
        packageType,
        priceId
      });

      console.log(' Service result:', JSON.stringify(result, null, 2));

      if (!result.success) {
        console.error(' Service returned error:', result.error);
        throw new Error(result.error);
      }

      return next(PaymentIntegrationResponsesFactory.paymentAttemptSuccess({ 
        paymentReference: result.sessionId,
        checkoutUrl: result.checkoutUrl,
        packageInfo: result.packageInfo
      }));

    } catch (error) {
      console.error(' Error creating checkout session:', error);
      console.error(' Error stack:', error.stack);
      throw error;
    }
  }

  static async creditsWebhook(req, res, next) {
    try {
      console.log(' Credits webhook received');
      
      const { success, event } = await StripeUtils.verifyCreditsWebhookSignature({ req });

      if (!success) {
        console.error(' Webhook signature verification failed');
        return next(AuthErrors.unauthorized());
      }

      console.log(' Webhook verified, event type:', event.type);

      switch (event.type) {
        case stripeEvents.checkoutSessionCompleted.value: {
          console.log(' Processing checkout.session.completed event');
          
          const session = event.data.object;
          
          if (session.metadata?.type === 'credits_purchase') {
            const result = await CreditsServices.handleCheckoutSessionCompleted({ session });
            
            if (!result.success) {
              console.error(' Error processing credits purchase:', result.error);
              throw new Error(result.error);
            }
            
            console.log(' Credits purchase processed successfully');
          } else {
            console.log('Skipping non-credits checkout session');
          }
          
          break;
        }
        default:
          console.log(' Unhandled event type:', event.type);
          return next(PaymentIntegrationErrorsFactory.unhandledEventErr());
      }

      return next(PaymentIntegrationResponsesFactory.eventCallSuccessfully());

    } catch (error) {
      console.error(' Critical error in credits webhook:', error.message);
      return next(PaymentIntegrationErrorsFactory.webhookError());
    }
  }

  static async getUserCreditsInfo(req, res, next) {
    try {
      const userId = req.jwtToken.user.id;

      console.log(' Getting credits info for user:', userId);

      const result = await CreditsServices.getUserCreditsInfo(userId);

      if (!result.success) {
        throw new Error(result.error);
      }

      return next(PaymentIntegrationResponsesFactory.eventCallSuccessfully({
        creditsInfo: result.data
      }));

    } catch (error) {
      console.error(' Error getting user credits info:', error);
      throw error;
    }
  }

  static async deductCredit(req, res, next) {
    try {
      const userId = req.jwtToken.user.id;

      console.log(' Deducting credit for user:', userId);

      const result = await CreditsServices.deductCredit(userId);
      console.log(' Service result:', JSON.stringify(result, null, 2));

      if (!result.success) {
        throw new Error(result.error);
      }

      const responseData = {
        creditsInfo: result.data,
        message: result.data.message
      };
      console.log(' Sending response:', JSON.stringify(responseData, null, 2));

      return next(PaymentIntegrationResponsesFactory.eventCallSuccessfully(responseData));

    } catch (error) {
      console.error(' Error deducting credit:', error);
      throw error;
    }
  }
};
