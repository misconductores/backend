const mongoose = require('mongoose');
const {statusTypes} = require('../constants/usersConstants');

const Schema = mongoose.Schema;

const offersSchema = new Schema(
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
    jobId: {
      type: String,
      ref: 'jobs',
      required: true,
    },
    status: {
      type: String,
      default: statusTypes.pending.value,
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

module.exports = mongoose.model('offers', offersSchema);
