const mongoose = require('mongoose');
const {statusTypes} = require('../constants/usersConstants');

const Schema = mongoose.Schema;

const DocumentsAccessSchema = new Schema(
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
    startDate: {type: String, required: true},
    endDate: {type: String, default: null},
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

module.exports = mongoose.model('documents_access', DocumentsAccessSchema);
