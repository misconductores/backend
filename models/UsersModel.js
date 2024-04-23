const mongoose = require('mongoose');

const {jwtUtils, passwordsUtils} = require('../utils');
const {usersConstants, generalConstant} = require('../constants');

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
    gender: {type: String},
    taxNumber: {type: String},
    carrierCode: {type: String}, // CAAT
    motorCarrier: {type: String}, // MC
    alphaCode: {type: String}, // SCAC
    companyDescription: {type: String},
    federalRegisterTax: {type: String}, // RFC
    postalAddress: {type: String},
    city: {type: String},
    country: {type: String},
    postalCode: {type: String},
    licenseName: {type: String},
    licenseCity: {type: String},
    licenseCountry: {type: String},
    federalLicenseNo: {type: String},
    federalLicenseType: {type: String},
    stateLicenseNo: {type: String},
    stateLicenseType: {type: String},
    experience: {type: Number},
    handleEquipment: {type: String},
    visaNumber: {type: String},
    visaExpiry: {type: String},
    fastNumber: {type: String},
    fastExpiry: {type: String},
    additionalDocumentName: {type: String},
    additionalDocumentId: {type: String},
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
    deptOfTransport: {type: String}, // DOT
    profilePic: {
      url: {type: String, default: null},
      key: {type: String, default: null},
    },
    verificationToken: {type: String},
    loginResetToken: {type: String},
  },
  {
    timestamps: true,
    toObject: {virtuals: true},
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.documents = ret.documents.map((doc) => {
          const {_id, id, ...rest} = doc;
          return rest;
        });
        return ret;
      },
    },
  }
);

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
