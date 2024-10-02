const config = require('config');
const {subscriptionStatuses} = require('../constants/usersConstants');
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

  static async getProducts() {
    try {
      const products = await Stripe.products.list({
        expand: ['data.default_price'],
      });

      const preparedData = products.data.map((product) => ({
        id: product.id,
        active: product.active,
        priceId: product.default_price?.id,
        price: product.default_price?.unit_amount / 100,
        description: product.description,
        metadata: product.metadata,
      }));

      return {success: true, products: preparedData};
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

  static async getSubscriptionByCustomerId({customerId, status}) {
    try {
      const subscriptions = await Stripe.subscriptions.list({
        customer: customerId,
        status: subscriptionStatuses.all.value,
      });

      const filteredSubscription = subscriptions.data.filter(
        (sub) => sub.status === status
      )[0];

      return {success: true, subscription: filteredSubscription};
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

  static async attachPaymentMethodToCustomer({data}) {
    try {
      const customerId = data?.customer;
      const paymentIntentId = data?.payment_intent;
      const paymentIntent = await Stripe.paymentIntents.retrieve(
        paymentIntentId
      );
      await Stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentIntent?.payment_method,
        },
      });
      return {success: true};
    } catch (error) {
      return {success: false, error};
    }
  }

  static async getInvoiceByInvoiceId({invoiceId}) {
    try {
      const latestInvoice = await Stripe.invoices.retrieve(invoiceId);
      return {success: true, invoice: latestInvoice};
    } catch (error) {
      return {success: false, error};
    }
  }
  static async updateSubscription({subscriptionId, data}) {
    try {
      await Stripe.subscriptions.update(subscriptionId, data);
      return {success: true};
    } catch (error) {
      return {success: false, error};
    }
  }
  static async cancelSubscription({subscriptionId}) {
    try {
      await Stripe.subscriptions.cancel(subscriptionId);
      return {success: true};
    } catch (error) {
      return {success: false, error};
    }
  }
};
