const {
  subscriptionModes,
  subscriptionTypes,
  checkoutSuccessUrl,
  checkoutCancelUrl,
  subscriptionStatuses,
  subscriptionProviders,
} = require('../constants/usersConstants');
const {
  SubscriptionsModel,
  SubscriptionHistoryModel,
  UsersModel,
} = require('../models');
const {
  getCurrentDate,
  getDateAfterOneMonth,
  getDateAfter1Year,
} = require('../utils/DateCalculations');
const StripeUtils = require('../utils/stripeUtils');
const GeneralServices = require('./generalServices');
const mongoose = require('mongoose');

module.exports = class SubscriptionsServices {
  static async getSubscriptionByUserId({userId}) {
    try {
      const {doc: subscription} = await GeneralServices.findOne({
        query: {userId},
        model: SubscriptionsModel,
      });
      return {success: true, subscription};
    } catch (error) {
      return {success: false, error};
    }
  }

  static async createSubscriptionHistory({
    subscription,
    subscriptionMode,
    session,
  }) {
    try {
      // Common data for both free and paid subscriptions
      const data = {
        subscriptionId: subscription.subscriptionId,
        transactionId: subscription.transactionId, // transaction Id is actually subscription id of stripe
        amount: subscription.amount,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        subscriptionMode,
        subscriptionType: subscription.subscriptionType,
      };

      // Create the new subscription history entry
      await SubscriptionHistoryModel.create([data], {session});

      return {success: true};
    } catch (error) {
      return {success: false, error};
    }
  }

  static async activateFreeSubscription({userId}) {
    try {
      const existedSubscription = await SubscriptionsModel.findOne({
        userId: userId,
      });

      const data = {
        userId,
        providerSubscriptionId: null,
        subscriptionProviders: null,
        status: subscriptionStatuses.active.value,
        startDate: getCurrentDate(),
        endDate: getDateAfterOneMonth(),
        subscriptionMode: subscriptionModes.free.value,
        subscriptionType: subscriptionTypes.monthly.value,
      };

      // if Pro user has degrade to free then it will update the existing one to free otherwise new subscription created if it is not present
      let subscription;
      if (existedSubscription) {
        subscription = await SubscriptionsModel.findOneAndUpdate(
          {
            userId: userId,
          },
          {$set: data},
          {new: true}
        );
      } else {
        const newSubscription = await SubscriptionsModel.create(data);
        subscription = newSubscription;
      }

      return {success: true, subscription};
    } catch (error) {
      return {success: false, error};
    }
  }

  static async activateProSubscription({subscriptionPlanId, email, name}) {
    try {
      const findCustomer = await StripeUtils.getCustomers({email});

      // will check the subscription if subscription creation failed
      const {subscription: incompleteSubscription} =
        await StripeUtils.getSubscriptionByCustomerId({
          customerId: findCustomer?.customers[0]?.id,
          status: subscriptionStatuses.incomplete.value,
        });

      // will check the subscription which is paused due too unpaid
      const {subscription: unpaidSubscription} =
        await StripeUtils.getSubscriptionByCustomerId({
          customerId: findCustomer?.customers[0]?.id,
          status: subscriptionStatuses.pastDue.value,
        });

      const subscription = incompleteSubscription || unpaidSubscription;

      let customer;
      if (!findCustomer?.customers[0]) {
        const createCustomer = await StripeUtils.createCustomer({name, email});
        customer = createCustomer?.customer;
      } else {
        customer = findCustomer?.customers[0];
      }

      const successUrl = checkoutSuccessUrl;
      const cancelUrl = checkoutCancelUrl;

      let processCheckoutSession;

      if (subscription) {
        // this will check whether same plan is updating or not
        const isNewPlan = subscription?.plan?.id !== subscriptionPlanId;

        // if there is new plan then cancel old subscription and create new subscription for new plan
        // if there is not a new plan but need to resume pause subscription
        if (isNewPlan) {
          await StripeUtils.cancelSubscription({
            subscriptionId: subscription?.id,
          });

          processCheckoutSession = await StripeUtils.createCheckout({
            customer: customer.id,
            line_items: [{price: subscriptionPlanId, quantity: 1}],
            mode: 'subscription',
            success_url: successUrl,
            cancel_url: cancelUrl,
          });
        } else {
          const latestInvoice = await StripeUtils.getInvoiceByInvoiceId({
            invoiceId: subscription.latest_invoice,
          });

          return {
            success: true,
            subscription: latestInvoice.invoice.hosted_invoice_url,
          };
        }
      } else {
        processCheckoutSession = await StripeUtils.createCheckout({
          customer: customer.id,
          line_items: [{price: subscriptionPlanId, quantity: 1}],
          mode: 'subscription',
          success_url: successUrl,
          cancel_url: cancelUrl,
        });
      }

      if (!processCheckoutSession?.success) throw processCheckoutSession.err;

      return {
        success: true,
        subscription: processCheckoutSession.checkoutUrl,
      };
    } catch (err) {
      return {success: false, err};
    }
  }

  static async handleInvoicePaidEvent({data}) {
    const session = await mongoose.startSession(); // start a transaction session
    session.startTransaction();

    try {
      const user = await UsersModel.findOne({
        email: data.customer_email,
      }).session(session);

      const existedSubscription = await SubscriptionsModel.findOne({
        userId: user.id,
      }).session(session);

      const isMonthlySubscription =
        data?.plan?.interval === subscriptionTypes.monthly.stripeValue;

      // Prepare data for the new pro subscription
      let finalData = {
        userId: user.id,
        providerSubscriptionId: data.subscription,
        subscriptionProviders: subscriptionProviders.stripe.value,
        status: subscriptionStatuses.active.value,
        startDate: getCurrentDate(),
        endDate: isMonthlySubscription
          ? getDateAfterOneMonth()
          : getDateAfter1Year(),
        subscriptionMode: subscriptionModes.paid.value,
        subscriptionType: isMonthlySubscription
          ? subscriptionTypes.monthly.value
          : subscriptionTypes.yearly.value,
      };

      // Scenario 1: Existing subscription
      if (existedSubscription) {
        const isFreeSubscriptionMode =
          existedSubscription.subscriptionMode === subscriptionModes.free.value;

        let historyData = {
          subscriptionId: existedSubscription.id,
          userId: user.id,
          startDate: existedSubscription.startDate,
          endDate: getCurrentDate(),
          subscriptionType: isMonthlySubscription
            ? subscriptionTypes.monthly.value
            : subscriptionTypes.yearly.value,
          amount: isFreeSubscriptionMode ? 0 : data.plan.amount / 100,
          subscriptionMode: subscriptionModes.free.value,
        };

        await SubscriptionsServices.createSubscriptionHistory({
          subscription: historyData,
          subscriptionMode: subscriptionModes.free.value,
          session,
        });

        // resume the subscription if paused
        await StripeUtils.updateSubscription({
          subscriptionId: data.subscription,
          data: {
            pause_collection: null,
            billing_cycle_anchor: 'now',
            proration_behavior: 'none',
          },
        });

        // Update subscription data
        await SubscriptionsModel.findOneAndUpdate(
          {providerSubscriptionId: existedSubscription.providerSubscriptionId},
          {$set: finalData},
          {new: true, session}
        );
      } else {
        // Scenario 2: First-time pro subscription (no history needed)
        await SubscriptionsModel.create([finalData], {
          session,
        });
      }

      // this will attach payment card to customer every time if it use different cards on expired subscription payment
      await StripeUtils.attachPaymentMethodToCustomer({data});

      await session.commitTransaction();
      session.endSession();
      return {success: true};
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return {success: false, error};
    }
  }

  static async changeUserSubscriptionToFree({data}) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await UsersModel.findOne({
        email: data.customer_email,
      }).session(session);

      const subscription = await SubscriptionsModel.findOne({
        userId: user.id,
      }).session(session);

      // if subscription update failed then pause the subscription and update subscription to free and history
      if (subscription) {
        await StripeUtils.updateSubscription({
          subscriptionId: subscription.providerSubscriptionId,
          data: {
            pause_collection: {
              behavior: 'mark_uncollectible',
            },
          },
        });

        const data = {
          userId: user?.id,
          providerSubscriptionId: null,
          subscriptionProviders: null,
          status: subscriptionStatuses.active.value,
          startDate: getCurrentDate(),
          endDate: getDateAfterOneMonth(),
          subscriptionMode: subscriptionModes.free.value,
          subscriptionType: subscriptionTypes.monthly.value,
        };

        await SubscriptionsModel.findByIdAndUpdate(
          {_id: subscription.id},
          {$set: data},
          {new: true, session}
        );

        let historyData = {
          subscriptionId: subscription.id,
          userId: user.id,
          startDate: subscription.startDate,
          amount: 0,
          endDate: getCurrentDate(),
          subscriptionType: subscription.subscriptionType,
          subscriptionMode: subscription.subscriptionMode,
        };

        await SubscriptionsServices.createSubscriptionHistory({
          subscription: historyData,
          subscriptionMode: subscription.subscriptionMode,
          session,
        });
      } else {
        await session.abortTransaction();
        session.endSession();
        return {success: false};
      }

      await session.commitTransaction();
      session.endSession();
      return {success: true};
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return {success: false, error};
    }
  }
};
