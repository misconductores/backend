const config = require('config');
const { subscriptionStatuses } = require('../constants/usersConstants');
const Stripe = require('stripe')(config.get('stripeSecretKey'));

module.exports = class StripeUtils {
  static async verifyWebhookSignature({ req }) {
    try {
      const sig = req.headers['stripe-signature'];
      const webhookSecret = config.get('stripeAccountWebHookSecret');

      const event = await Stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );

      return { success: true, event };
    } catch (err) {
      return { success: false, err };
    }
  }

  static async verifyServicePaymentWebhookSignature({ req }) {
    try {
      const sig = req.headers['stripe-signature'];
      const webhookSecret = config.get('stripeServicePaymentWebHookSecret');

      const event = await Stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );

      return { success: true, event };
    } catch (err) {
      return { success: false, err };
    }
  }

  static async getProducts() {
    try {
      console.log('🔍 Fetching products from Stripe...');

      // Método 1: Intentar con expand tradicional
      let products;
      try {
        products = await Stripe.products.list({
          expand: ['data.default_price'],
        });
        console.log('✅ Method 1 (expand array) worked');
      } catch (expandError) {
        console.log('❌ Method 1 failed, trying method 2...');

        // Método 2: Intentar con expand como string
        try {
          products = await Stripe.products.list({
            expand: 'data.default_price',
          });
          console.log('✅ Method 2 (expand string) worked');
        } catch (stringError) {
          console.log('❌ Method 2 failed, trying method 3...');

          // Método 3: Sin expand, obtener productos y luego precios
          products = await Stripe.products.list();
          console.log('✅ Method 3 (no expand) worked');
        }
      }

      console.log(`📦 Found ${products.data.length} products`);

      const preparedData = [];

      for (const product of products.data) {
        console.log(`\n🔍 Processing product: ${product.id} (${product.name})`);
        console.log('Product details:', {
          active: product.active,
          metadata: product.metadata,
          default_price: product.default_price
        });

        // Filtrar solo productos activos que tengan metadata.interval
        if (!product.active || !product.metadata || !product.metadata.interval) {
          console.log('❌ Skipping: missing active/metadata/interval');
          continue;
        }

        let price = null;
        let priceId = null;

        // Si default_price está expandido (es un objeto)
        if (product.default_price && typeof product.default_price === 'object' && product.default_price.unit_amount) {
          price = product.default_price.unit_amount / 100;
          priceId = product.default_price.id;
          console.log('✅ Using expanded default_price:', { price, priceId });
        }
        // Si default_price es solo un ID (string)
        else if (product.default_price && typeof product.default_price === 'string') {
          console.log('🔄 default_price is ID, fetching price details...');
          try {
            const priceDetails = await Stripe.prices.retrieve(product.default_price);
            if (priceDetails.unit_amount) {
              price = priceDetails.unit_amount / 100;
              priceId = priceDetails.id;
              console.log('✅ Retrieved price details:', { price, priceId });
            }
          } catch (priceError) {
            console.log('❌ Error retrieving price:', priceError.message);
          }
        }
        // Si no hay default_price, buscar precios asociados
        else {
          console.log('🔄 No default_price, searching associated prices...');
          try {
            const prices = await Stripe.prices.list({
              product: product.id,
              active: true,
              limit: 1
            });

            if (prices.data.length > 0 && prices.data[0].unit_amount) {
              price = prices.data[0].unit_amount / 100;
              priceId = prices.data[0].id;
              console.log('✅ Found associated price:', { price, priceId });
            }
          } catch (priceError) {
            console.log('❌ Error fetching associated prices:', priceError.message);
          }
        }

        // Solo incluir productos que tengan precio
        if (price !== null && priceId) {
          const productData = {
            id: product.id,
            active: product.active,
            priceId: priceId,
            price: price,
            description: product.description,
            metadata: product.metadata,
          };
          preparedData.push(productData);
          console.log('✅ Added product to results:', productData);
        } else {
          console.log('❌ Skipping: no valid price found');
        }
      }

      console.log(`\n🎉 Final result: ${preparedData.length} products with valid prices`);
      return { success: true, products: preparedData };
    } catch (err) {
      console.error('❌ Error in getProducts:', err);
      return { success: false, err };
    }
  }

  static async getCustomers({ ...args }) {
    try {
      const customers = await Stripe.customers.list({ ...args });
      return { success: true, customers: customers.data };
    } catch (err) {
      return { success: false, err };
    }
  }

  static async createCustomer({ name, email }) {
    try {
      const customer = await Stripe.customers.create({ name, email });
      return { success: true, customer };
    } catch (err) {
      return { success: false, err };
    }
  }

  static async getSubscriptionById({ subscriptionId }) {
    try {
      const subscription = await Stripe.subscriptions.retrieve(subscriptionId);
      return { success: true, subscription };
    } catch (err) {
      return { success: false, err };
    }
  }

  static async getSubscriptionByCustomerId({ customerId, status }) {
    try {
      const subscriptions = await Stripe.subscriptions.list({
        customer: customerId,
        status: subscriptionStatuses.all.value,
      });

      const filteredSubscription = subscriptions.data.filter(
        (sub) => sub.status === status
      )[0];

      return { success: true, subscription: filteredSubscription };
    } catch (err) {
      return { success: false, err };
    }
  }

  static async getSubscriptions({ ...args }) {
    try {
      const subscriptions = await Stripe.subscriptions.list({ ...args });
      return { success: true, subscriptions: subscriptions.data };
    } catch (err) {
      return { success: false, err };
    }
  }

  static async createCheckout({ ...args }) {
    try {
      const session = await Stripe.checkout.sessions.create({ ...args });
      return { success: true, checkoutUrl: session.url };
    } catch (err) {
      return { success: false, err };
    }
  }

  static async attachPaymentMethodToCustomer({ data }) {
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
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  static async getInvoiceByInvoiceId({ invoiceId }) {
    try {
      const latestInvoice = await Stripe.invoices.retrieve(invoiceId);
      return { success: true, invoice: latestInvoice };
    } catch (error) {
      return { success: false, error };
    }
  }
  static async updateSubscription({ subscriptionId, data }) {
    try {
      await Stripe.subscriptions.update(subscriptionId, data);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }
  static async cancelSubscription({ subscriptionId }) {
    try {
      await Stripe.subscriptions.cancel(subscriptionId);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }
  static async resumeSubscription({ subscriptionId }) {
    try {
      await Stripe.subscriptions.resume(subscriptionId, {
        billing_cycle_anchor: 'now',
      });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  static async getPaymentIntent({ paymentIntentId }) {
    try {
      const paymentIntent = await Stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error retrieving Payment Intent', error);
      throw error;
    }
  }

  static async createCreditsCheckoutSession({ priceId, userId, successUrl, cancelUrl }) {
    try {
      const session = await Stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: userId, // pasamos el id del usuario para poder identificarlo en el pago y realizar la validacion
        metadata: {
          type: 'credits_purchase',
          userId: userId
        }
      });

      return { success: true, checkoutUrl: session.url, sessionId: session.id };
    } catch (error) {
      console.error('Error creating credits checkout session:', error);
      return { success: false, error };
    }
  }

  static async verifyCreditsWebhookSignature({ req }) {
    try {
      const sig = req.headers['stripe-signature'];
      const webhookSecret = config.get('stripeCreditsWebHookSecret');

      const event = await Stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );

      return { success: true, event };
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return { success: false, err };
    }
  }
};
