const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const jobSchema = new Schema(
  {
    title: {type: String},
    experience: {type: Number},
    location: {type: String},
    description: {type: String},
    responsibility: {type: String},
    applicants: [
      {type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: []},
    ],
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
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

module.exports = mongoose.model('jobs', jobSchema);
