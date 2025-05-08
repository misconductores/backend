const mongoose = require('mongoose');

const {jwtUtils, passwordsUtils} = require('../utils');
const {usersConstants, generalConstant} = require('../constants');
const {
  genderOptions,
  federalLicenseTypes,
  stateLicenseTypes,
} = require('../constants/usersConstants');
const {calculateAge} = require('../utils/DateCalculations');

const Schema = mongoose.Schema;

const levels = Object.values(usersConstants.ACCESS_LEVELS);

const permissionsSchema = {type: String, enum: levels, default: levels};

const usersSchema = new Schema(
  {
    firstName: {type: String},
    lastName: {type: String},
    companyName: {type: String},
    email: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 255,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 2048,
    },
    gender: {type: String, enum: genderOptions},
    taxNumber: {type: String},
    carrierCode: {type: String, maxlength: 11}, // CAAT
    motorCarrier: {type: String, maxlength: 8}, // MC
    alphaCode: {type: String, maxlength: 4}, // SCAC
    companyDescription: {type: String},
    federalRegisterTax: {type: String, maxlength: 13}, // RFC
    postalAddress: {type: String},
    area: {type: String},
    city: {type: String},
    country: {type: String},
    postalCode: {type: String},
    licenseName: {type: String},
    licenseCity: {type: String},
    licenseCountry: {type: String},
    federalLicenses: [
      {
        federalLicenseNo: {type: String, maxlength: 15},
        federalLicenseType: {type: String, enum: federalLicenseTypes},
        expiryDate: {type: String},
      },
    ],
    stateLicenses: [
      {
        stateLicenseNo: {type: String, maxlength: 15},
        stateLicenseType: {type: String, enum: stateLicenseTypes},
        expiryDate: {type: String},
      },
    ],
    experience: {type: String},
    handleEquipment: [{type: String}],
    vehicleType: {type: String},
    visaNumber: {type: String},
    visaExpiry: {type: String},
    fastNumber: {type: String},
    fastExpiry: {type: String},
    additionalDocuments: [
      {
        additionalDocumentName: {type: String},
        additionalDocumentId: {type: String},
      },
    ],

    role: {type: String, required: true},
    isVerified: {type: Boolean, default: false},
    driverStatus: {type: String},
    documents: [
      {
        url: {type: String},
        key: {type: String},
        label: {type: String},
      },
    ],
    dateOfBirth: {type: String},
    contact: {type: String},
    deptOfTransport: {type: String, maxlength: 12}, // DOT
    profilePic: {
      url: {type: String, default: null},
      key: {type: String, default: null},
    },
    verificationToken: {type: String},
    loginResetToken: {type: String},
    fmsca: {},
  },
  {
    timestamps: true,
    toObject: {virtuals: true},
    toJSON: {
      virtuals: true,
    },
  }
);

usersSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const age = calculateAge({dateOfBirth: this.dateOfBirth});
  return parseInt(age);
});

usersSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password
  this.password = await passwordsUtils.saltHashPassword({
    password: this.password,
  });
  next();
});

usersSchema.methods = {
  generateResetToken: function () {
    const payload = {email: this.email};
    const expiry = generalConstant.passwordResetTokenExpiry;
    const resetToken = jwtUtils.generateToken({payload, expiry});

    this.loginResetToken = resetToken;

    return resetToken;
  },
  generateVerificationToken: function () {
    const payload = {id: this._id, email: this.email};
    const expiry = generalConstant.accountVerificationTokenExpiry;
    const verificationToken = jwtUtils.generateToken({payload, expiry});

    this.verificationToken = verificationToken;

    return verificationToken;
  },
};

module.exports = mongoose.model('Users', usersSchema);
