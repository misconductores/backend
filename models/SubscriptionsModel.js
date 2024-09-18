const mongoose = require('mongoose');
const {
  subscriptionStatuses,
  subscriptionModes,
} = require('../constants/usersConstants');

const Schema = mongoose.Schema;

const subscriptionStatusEnums = Object.values(subscriptionStatuses).map(
  (status) => status.value
);

const subscriptionModeEnums = Object.values(subscriptionModes).map(
  (mode) => mode.value
);

const SubscriptionsSchema = new Schema(
  {
    companyId: {
      type: String,
      ref: 'Users',
      required: true,
    },
    subScriptionId: {
      type: String,
    },
    status: {
      type: String,
      default: subscriptionStatuses.active.value,
      enum: subscriptionStatusEnums,
    },
    startDate: {
      // Start date will be added if company has purchase monthly or yearly plan, this is not applicable for free mode
      type: String,
    },
    endDate: {
      type: String,
    },
    subscriptionMode: {
      type: String,
      required: true,
      enum: subscriptionModeEnums,
    },
  },
  {
    timestamps: true,
    toObject: {virtuals: true},
    toJSON: {
      virtuals: true,
    },
  }
);

module.exports = mongoose.model('subscriptions', SubscriptionsSchema);
