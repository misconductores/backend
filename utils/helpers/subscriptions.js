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
  calculateOneYearAheadDate,
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
    endDate: isMonthlySubscription
      ? calculateOneMonthAheadDate({date: startDate})
      : calculateOneYearAheadDate({date: startDate}),
    subscriptionMode: subscriptionModes.paid.value,
    subscriptionType: isMonthlySubscription
      ? subscriptionTypes.monthly.value
      : subscriptionTypes.yearly.value,
  };
  return data;
};

exports.prepareHistoryData = ({
  eventData,
  subscription,
  userId,
  isFreeModeHistory = false,
}) => {
  const isMonthlySubscription =
    eventData.lines?.data[0]?.plan?.interval ===
    subscriptionTypes.monthly.stripeValue;

  let endDate = convertTimestampsToDate({
    timestamps: eventData.period_start,
  });

  let amount = eventData.total / 100;
  let subscriptionMode = subscriptionModes.paid.value;
  let subscriptionType = isMonthlySubscription
    ? subscriptionTypes.monthly.value
    : subscriptionTypes.yearly.value;

  // Override if it's free mode history
  if (isFreeModeHistory) {
    endDate = subscription.endDate;
    amount = 0;
    subscriptionMode = subscriptionModes.free.value;
    subscriptionType = subscriptionTypes.monthly.value;
  } else if (subscription.subscriptionMode === subscriptionModes.free.value) {
    amount = 0;
    subscriptionMode = subscriptionModes.free.value;
    subscriptionType = subscriptionTypes.monthly.value;
  }

  let data = {
    subscriptionId: subscription.id,
    userId,
    startDate: subscription.startDate,
    endDate,
    subscriptionType,
    amount,
    subscriptionMode,
  };

  return data;
};
