//create schema for service with this fields title, location, description, payment options, price, buttonText and paymentLink
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const serviceSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    paymentOptions: {
        type: [String],
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    buttonText: {
        type: String,
        required: true,
    },
    paymentLink: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false,
    },
});

module.exports = mongoose.model('Services', serviceSchema);
