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
        required: false,
    },
    description: {
        type: String,
        required: false,
    },
    paymentOptions: {
        type: [String],
        required: false,
    },
    price: {
        type: String,
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
    emailTemplateId: {
        type: String,
        required: false,
    },
    requirements: {
        type: [String],
        required: false,
    },
    afterPaymentOpts: {
        type: [String],
        required: false,
    },
    customerEmailTemplateId: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('Services', serviceSchema);
