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
      // Find the user's last subscription history (check for both free and paid)
      const lastHistory = await SubscriptionHistoryModel.findOne({
        subscriptionId: subscription.subscriptionId,
        endDate: {$gte: getCurrentDate()},
      })
        .sort({startDate: -1})
        .session(session);

      // If the last subscription exists, update its endDate
      if (lastHistory) {
        lastHistory.endDate = subscription.startDate;
        await lastHistory.save({session});
      }

      // Common data for both free and paid subscriptions
      const data = {
        subscriptionId: subscription.subscriptionId,
        transactionId:
          subscriptionMode === subscriptionModes.free.value
            ? null
            : subscription.transactionId, // transaction Id is actually subscription id of stripe
        amount:
          subscriptionMode === subscriptionModes.free.value
            ? 0
            : subscription.amount,
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
    const session = await mongoose.startSession(); // start a transaction session
    session.startTransaction();

    try {
      const existedSubscription = await SubscriptionsModel.findOne({
        userId: userId,
      }).session(session);

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
          {new: true},
          {session}
        );
      } else {
        const newSubscription = await SubscriptionsModel.create([data], {
          session,
        });
        subscription = newSubscription[0].toObject();
      }

      if (subscription) {
        let finalData = {
          ...subscription,
          subscriptionId: subscription.id, // this is added to make same data format for creating history free and pro mode
        };
        const {error} = await SubscriptionsServices.createSubscriptionHistory({
          subscription: finalData,
          subscriptionMode: subscriptionModes.free.value,
          session,
        });
        if (error) throw error;
      }

      await session.commitTransaction();
      session.endSession();
      return {success: true, subscription};
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return {success: false, error};
    }
  }

  static async activateProSubscription({subscriptionPlanId, email, name}) {
    try {
      const findCustomer = await StripeUtils.getCustomers({email});

      let customer;
      if (!findCustomer?.customers[0]) {
        const createCustomer = await StripeUtils.createCustomer({name, email});
        customer = createCustomer?.customer;
      } else {
        customer = findCustomer?.customers[0];
      }

      const successUrl = checkoutSuccessUrl;
      const cancelUrl = checkoutCancelUrl;

      const processCheckoutSession = await StripeUtils.createCheckout({
        customer: customer.id,
        line_items: [{price: subscriptionPlanId, quantity: 1}],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      if (!processCheckoutSession?.success) throw processCheckoutSession.err;

      return {success: true, subscription: processCheckoutSession.checkoutUrl};
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
        data.lines?.data[0]?.plan?.interval ===
        subscriptionTypes.monthly.stripeValue;

      // prepare data for subscription model
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

      let subscription;

      if (existedSubscription) {
        subscription = await SubscriptionsModel.findOneAndUpdate(
          {
            providerSubscriptionId: existedSubscription.providerSubscriptionId,
          },
          {$set: finalData},
          {new: true},
          {session}
        );
      } else {
        const newSubscription = await SubscriptionsModel.create([finalData], {
          session,
        });
        subscription = newSubscription[0];
      }

      // prepare data for subscription history model
      if (subscription) {
        let historyData = {
          ...finalData,
          subscriptionId: subscription.id,
          amount: data.amount_paid / 100,
          transactionId: data.subscription,
        };

        const {error} = await SubscriptionsServices.createSubscriptionHistory({
          subscription: historyData,
          subscriptionMode: subscriptionModes.paid.value,
          session,
        });

        if (error) throw error;
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
