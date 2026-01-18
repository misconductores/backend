const mongoose = require('mongoose');
const {
  subscriptionStatuses,
  subscriptionProviders,
  roles,
  subscriptionStatusEnums,
  subscriptionModeEnums,
  subscriptionTypeEnums,
} = require('../constants/usersConstants');

const Schema = mongoose.Schema;

const SubscriptionsSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    userType: {
      type: String,
      required: true,
      default: roles.company.value,
    },
    providerSubscriptionId: {
      type: String,
    },
    subscriptionProviders: {
      type: String,
      default: subscriptionProviders.stripe.value,
    },
    status: {
      type: String,
      default: subscriptionStatuses.active.value,
      enum: subscriptionStatusEnums,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
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

module.exports = mongoose.model('subscriptions', SubscriptionsSchema);
