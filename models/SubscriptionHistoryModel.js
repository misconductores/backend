const mongoose = require('mongoose');
const {
  subscriptionModeEnums,
  subscriptionTypeEnums,
} = require('../constants/usersConstants');

const Schema = mongoose.Schema;

const SubscriptionHistorySchema = new Schema(
  {
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'subscriptions',
      required: true,
    },
    transactionId: {
      type: String,
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
