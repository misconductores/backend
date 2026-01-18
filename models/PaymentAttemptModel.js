const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentAttemptSchema = new Schema({
    paymentReference: {
        type: String,
        required: true,
    },
    serviceId: {
        type: Schema.Types.ObjectId,
        ref: 'Services',
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    intent: {
        type: Object,
        required: false,
    }
}, { timestamps: true });

module.exports = mongoose.model('PaymentAttempt', paymentAttemptSchema);