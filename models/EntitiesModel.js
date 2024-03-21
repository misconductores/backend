const mongoose = require('mongoose');
const {Schema} = mongoose;

const entitiesSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'It must have a title'],
    },
  },
  {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}}
);

module.exports = mongoose.model('Entities', entitiesSchema);
