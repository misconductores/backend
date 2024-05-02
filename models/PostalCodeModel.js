const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postalCodeSchema = new Schema(
  {
    postalCode: {type: Number},
    area_type: {type: String},
    area: {type: String},
    muncipality: {type: String},
    city: {type: String},
  },
  {
    timestamps: false,
    toObject: {virtuals: true},
    toJSON: {
      virtuals: true,
    },
  }
);

module.exports = mongoose.model('postal_codes', postalCodeSchema);
