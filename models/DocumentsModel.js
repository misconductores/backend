const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const documentSchema = new Schema(
  {
    url: {type: String, required: true},
    key: {type: String, required: true},
    label: {type: String, required: true},
  },
  {
    timestamps: false,
    toObject: {virtuals: true},
    toJSON: {
      virtuals: true,
    },
  }
);

module.exports = mongoose.model('Documents', documentSchema);
