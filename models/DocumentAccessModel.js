const mongoose = require('mongoose');
const {
  statusTypes,
  documentRequestTypes,
} = require('../constants/usersConstants');

const Schema = mongoose.Schema;

const DocumentsAccessSchema = new Schema(
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
    startDate: {type: Date, required: true},
    endDate: {type: Date, default: null},
    type: {
      type: String,
      required: true,
      enum: Object.values(documentRequestTypes).map((status) => status.value),
    },
    status: {
      type: String,
      default: statusTypes.pending.value,
      enum: Object.values(statusTypes).map((status) => status.value),
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
