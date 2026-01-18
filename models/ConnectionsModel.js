const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const connectionsModel = new Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'offers',
      required: true,
    },
    status: {
      type: String,
      required: true,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'reviews',
      default: null,
    },
    driverReviewId: {
      type: mongoose.Schema.Types.ObjectId,
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
