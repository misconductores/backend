const mongoose = require('mongoose');
const {
  subscriptionModes,
  subscriptionTypes,
} = require('../constants/usersConstants');

const Schema = mongoose.Schema;

const subscriptionModeEnums = Object.values(subscriptionModes).map(
  (mode) => mode.value
);

const subscriptionTypeEnums = Object.values(subscriptionTypes).map(
  (type) => type.value
);

const SubscriptionHistorySchema = new Schema(
  {
    subscriptionId: {
      type: String,
      ref: 'subscriptions',
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    subscriptionMode: {
      type: String,
      required: true,
      enum: subscriptionModeEnums,
    },
    subscriptionType: {
      type: String,
      required: true,
      enum: subscriptionTypeEnums,
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

module.exports = mongoose.model(
  'subscriptions_history',
  SubscriptionHistorySchema
);
