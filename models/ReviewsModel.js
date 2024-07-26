const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ReviewsSchema = new Schema(
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
    connectionId: {
      type: String,
      ref: 'connections',
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    description: {type: String, required: true},
    averageRating: {type: String, required: true},
    status: {
      type: String,
      required: true,
    },
    communication: {type: String, default: null},
    obligationsAndDuties: {type: String, default: null},
    significantProblems: {type: String, default: null},
    reasonToLeave: {type: String, default: null},
    careUnit: {
      type: String,
      default: '0.0',
    },
    cleaningUnit: {
      type: String,
      default: '0.0',
    },
    punctualityUnit: {
      type: String,
      default: '0.0',
    },
    performance: {
      type: String,
      default: '0.0',
    },
    personalRelations: {
      type: String,
      default: '0.0',
    },
    trucks: {
      type: String,
      default: '0.0',
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

module.exports = mongoose.model('reviews', ReviewsSchema);
