const mongoose = require('mongoose');
const {notificationTypes} = require('../constants/usersConstants');

const Schema = mongoose.Schema;

const notificationTypeEnums = Object.values(notificationTypes).map(
  (type) => type.value
);

const notificationSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    relatedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
    },
    type: {
      type: String,
      required: true,
      enum: notificationTypeEnums,
    },
    isRead: {
      type: Boolean,
      default: false,
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

module.exports = mongoose.model('notifications', notificationSchema);
