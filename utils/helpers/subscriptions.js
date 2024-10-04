const {
  subscriptionStatuses,
  subscriptionModes,
  subscriptionTypes,
  subscriptionProviders,
} = require('../../constants/usersConstants');
const {
  getCurrentDate,
  getDateAfterOneMonth,
  convertTimestampsToDate,
  calculateOneMonthAheadDate,
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
    eventData?.lines?.data[0]?.plan?.interval ===
    subscriptionTypes.monthly.stripeValue;

  const startDate = convertTimestampsToDate({
    timestamps: eventData.period_start,
  });

  let data = {
    userId,
    providerSubscriptionId: eventData.subscription,
    subscriptionProviders: subscriptionProviders.stripe.value,
    status: subscriptionStatuses.active.value,
    startDate,
    endDate: calculateOneMonthAheadDate({date: startDate}),
    subscriptionMode: subscriptionModes.paid.value,
    subscriptionType: isMonthlySubscription
      ? subscriptionTypes.monthly.value
      : subscriptionTypes.yearly.value,
  };
  return data;
};

exports.prepareHistoryData = ({eventData, subscription, userId}) => {
  const isMonthlySubscription =
    eventData.lines?.data[0]?.plan?.interval ===
    subscriptionTypes.monthly.stripeValue;

  const isFreeSubscriptionMode =
    subscription.subscriptionMode === subscriptionModes.free.value;

  const endDate = convertTimestampsToDate({
    timestamps: eventData.period_start,
  });

  let data = {
    subscriptionId: subscription.id,
    userId,
    startDate: subscription.startDate,
    endDate,
    subscriptionType: isMonthlySubscription
      ? subscriptionTypes.monthly.value
      : subscriptionTypes.yearly.value,
    amount: isFreeSubscriptionMode ? 0 : eventData.total / 100,
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
    endDate: subscription.endDate,
    subscriptionType: subscription.subscriptionType,
    subscriptionMode: subscription.subscriptionMode,
  };
  return data;
};
