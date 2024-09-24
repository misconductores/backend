const config = require('config');
const Stripe = require('stripe')(config.get('stripeSecretKey'));

module.exports = class StripeUtils {
  static async verifyWebhookSignature({req}) {
    try {
      const sig = req.headers['stripe-signature'];
      const webhookSecret = config.get('stripeAccountWebHookSecret');

      const event = await Stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );

      return {success: true, event};
    } catch (err) {
      return {success: false, err};
    }
  }

  static async getProducts({...args}) {
    try {
      const products = await Stripe.products.list({...args});
      return {success: true, products: products.data};
    } catch (err) {
      return {success: false, err};
    }
  }

  static async getProductsBySearch({query}) {
    try {
      const products = await Stripe.products.search({query});

      return {success: true, products: products.data};
    } catch (err) {
      return {success: false, err};
    }
  }

  static async getCustomers({...args}) {
    try {
      const customers = await Stripe.customers.list({...args});
      return {success: true, customers: customers.data};
    } catch (err) {
      return {success: false, err};
    }
  }

  static async createCustomer({name, email}) {
    try {
      const customer = await Stripe.customers.create({name, email});
      return {success: true, customer};
    } catch (err) {
      return {success: false, err};
    }
  }

  static async getSubscriptionById({subscriptionId}) {
    try {
      const subscription = await Stripe.subscriptions.retrieve(subscriptionId);
      return {success: true, subscription};
    } catch (err) {
      return {success: false, err};
    }
  }

  static async getSubscriptions({...args}) {
    try {
      const subscriptions = await Stripe.subscriptions.list({...args});
      return {success: true, subscriptions: subscriptions.data};
    } catch (err) {
      return {success: false, err};
    }
  }

  static async createCheckout({...args}) {
    try {
      const session = await Stripe.checkout.sessions.create({...args});
      return {success: true, checkoutUrl: session.url};
    } catch (err) {
      return {success: false, err};
    }
  }

  static async getShipmentRate({shippingId}) {
    try {
      const shippingRate = await Stripe.shippingRates.retrieve(shippingId);

      return {success: true, shippingRate};
    } catch (err) {
      return {success: false, err};
    }
  }
};
