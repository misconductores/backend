const {
  subscriptionModes,
  subscriptionTypes,
  checkoutSuccessUrl,
  checkoutCancelUrl,
} = require('../constants/usersConstants');
const {SubscriptionsModel, SubscriptionHistoryModel} = require('../models');
const {
  getCurrentDate,
  getDateAfterOneMonth,
  getDateAfter1Year,
} = require('../utils/DateCalculations');
const StripeUtils = require('../utils/stripeUtils');
const GeneralServices = require('./generalServices');
const UsersServices = require('./usersServices');
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

  static async createFreeSubscriptionHistory({subscription}) {
    try {
      const data = {
        subscriptionId: subscription.id,
        transactionId: null,
        amount: 0,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        subscriptionMode: subscription.subscriptionMode,
        subscriptionType: subscription.subscriptionType,
      };
      await GeneralServices.create({
        data: data,
        model: SubscriptionHistoryModel,
      });
      return {success: true};
    } catch (error) {
      return {success: false, error};
    }
  }

  static async createProSubscriptionHistory({data}) {
    const session = await mongoose.startSession(); // start a transaction session
    session.startTransaction();

    try {
      //  Find the user's last subscription history (assuming there’s a userId field to identify them)
      const lastHistory = await SubscriptionHistoryModel.findOne({
        subscriptionId: data.subscriptionId,
        endDate: {$gte: getCurrentDate()},
      })
        .sort({startDate: -1})
        .session(session);

      //  If a previous history exists, update its `endDate` to the new subscription start date
      if (lastHistory) {
        lastHistory.endDate = getCurrentDate();
        await lastHistory.save({session});
      }

      const finalData = {
        subscriptionId: data.subscriptionId,
        transactionId: data.transactionId,
        amount: data.amount,
        startDate: data.startDate,
        endDate: data.endDate,
        subscriptionMode: data.subscriptionMode,
        subscriptionType: data.subscriptionType,
      };

      await SubscriptionHistoryModel.create([finalData], {session});

      await session.commitTransaction();
      session.endSession();

      return {success: true};
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return {success: false, error};
    }
  }

  static async activateFreeSubscription({userId}) {
    try {
      const data = {
        userId,
        providerSubscriptionId: null,
        subscriptionProviders: null,
        startDate: getCurrentDate(),
        endDate: getDateAfterOneMonth(),
        subscriptionMode: subscriptionModes.free.value,
        subscriptionType: subscriptionTypes.monthly.value,
      };

      const {doc: subscription} = await GeneralServices.create({
        data,
        model: SubscriptionsModel,
      });
      if (subscription) {
        await SubscriptionsServices.createFreeSubscriptionHistory({
          subscription,
        });
      }
      return {success: true, subscription};
    } catch (error) {
      return {success: false, error};
    }
  }

  static async activateProSubscription({providerSubscriptionId, email, name}) {
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
        line_items: [{price: providerSubscriptionId, quantity: 1}],
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
    try {
      const user = await UsersServices.getUserByEmail({
        email: data.customer_email,
      });

      const {doc: existedSubscription} = await GeneralServices.findOne({
        query: {userId: user.id},
        model: SubscriptionsModel,
      });

      const isMonthlySubscription =
        data.lines?.data[0]?.plan?.interval ===
        subscriptionTypes.monthly.stripeValue;

      // prepare data for subscription model
      let finalData = {
        userId: user.id,
        providerSubscriptionId: data.subscription,
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
          {new: true}
        );
      } else {
        const {doc: newSubscription} = await GeneralServices.create({
          data: finalData,
          model: SubscriptionsModel,
        });
        subscription = newSubscription;
      }

      // prepare data for subscription history model
      let historyData = {
        ...finalData,
        subscriptionId: subscription.id,
        amount: data.amount_paid / 100,
        transactionId: data.subscription,
      };

      await SubscriptionsServices.createProSubscriptionHistory({
        data: historyData,
      });
      return {success: true};
    } catch (error) {
      return {success: false, error};
    }
  }
};
