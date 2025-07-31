const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const Schema = mongoose.Schema;

const preRegisteredDriverSchema = new Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        dateOfBirth: { type: Date, required: true },
        gender: { type: String, required: true },
        contact: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        licenseNumber: { type: String, required: true },
        federalLicenseType: { type: String, required: true },
        licenseExpiration: { type: Date, required: true },
        preRegistrationToken: { type: String, required: true, default: uuidv4 },
        tokenExpiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from creation
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'rejected', 'passwordSet'],
            default: 'pending',
        },
        role: {
            type: String,
            enum: ['driver', 'company'],
            default: 'driver',
        },
        password: { type: String },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
        isVerified: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

module.exports = mongoose.model('PreRegisteredDriver', preRegisteredDriverSchema);