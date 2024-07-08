const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const connectionsModel = new Schema(
  {
    companyId: {
      type: String,
      ref: 'Users',
      required: true,
    },
    driverId: {
      type: String,
      ref: 'Users',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    reviewEndDate: {
      type: Date,
      default: null,
    },
    companyReviewId: {
      type: String,
      ref: 'reviews',
      default: null,
    },
    driverReviewId: {
      type: String,
      ref: 'reviews',
      default: null,
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

module.exports = mongoose.model('connections', connectionsModel);
