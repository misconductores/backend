const mongoose = require('mongoose');
const {statusTypes} = require('../constants/usersConstants');

const Schema = mongoose.Schema;

const offersSchema = new Schema(
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
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
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
