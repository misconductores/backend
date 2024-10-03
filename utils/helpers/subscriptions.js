const {
  subscriptionStatuses,
  subscriptionModes,
  subscriptionTypes,
  subscriptionProviders,
} = require('../../constants/usersConstants');
const {
  getCurrentDate,
  getDateAfterOneMonth,
  getDateAfter1Year,
} = require('../DateCalculations');

exports.prepareFreeSubscriptionData = ({userId}) => {
  let data = {
    userId,
    providerSubscriptionId: null,
    subscriptionProviders: null,
    status: subscriptionStatuses.active.value,
    startDate: getCurrentDate(),
    endDate: getDateAfterOneMonth(),
    subscriptionMode: subscriptionModes.free.value,
    subscriptionType: subscriptionTypes.monthly.value,
  };
  return data;
};

exports.prepareProSubscriptionData = ({eventData, userId}) => {
  const isMonthlySubscription =
    eventData?.plan?.interval === subscriptionTypes.monthly.stripeValue;

  let data = {
    userId,
    providerSubscriptionId: eventData.subscription,
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
  return data;
};

exports.prepareHistoryData = ({eventData, subscription, userId}) => {
  const isMonthlySubscription =
    eventData?.plan?.interval === subscriptionTypes.monthly.stripeValue;
  const isFreeSubscriptionMode =
    subscription.subscriptionMode === subscriptionModes.free.value;

  let data = {
    subscriptionId: subscription.id,
    userId,
    startDate: subscription.startDate,
    endDate: getCurrentDate(),
    subscriptionType: isMonthlySubscription
      ? subscriptionTypes.monthly.value
      : subscriptionTypes.yearly.value,
    amount: isFreeSubscriptionMode ? 0 : eventData.plan.amount / 100,
    subscriptionMode: subscriptionModes.free.value,
  };
  return data;
};

exports.prepareFreeModeHistoryData = ({subscription, userId}) => {
  let data = {
    subscriptionId: subscription.id,
    userId,
    startDate: subscription.startDate,
    amount: 0,
    endDate: getCurrentDate(),
    subscriptionType: subscription.subscriptionType,
    subscriptionMode: subscription.subscriptionMode,
  };
  return data;
};
