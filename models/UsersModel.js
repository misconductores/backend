const mongoose = require('mongoose');

const {jwtUtils, passwordsUtils} = require('../utils');
const {usersConstants, generalConstant} = require('../constants');

const Schema = mongoose.Schema;

const levels = Object.values(usersConstants.ACCESS_LEVELS);

const permissionsSchema = {type: String, enum: levels, default: levels};

const usersSchema = new Schema(
  {
    firstName: {type: String, required: [true, 'User must have a first name']},
    lastName: {type: String, required: [true, 'User must have a last name']},
    email: {
      type: String,
      required: [true, 'User must have a email'],
      minlength: 4,
      maxlength: 255,
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'User must have a password'],
      minlength: 6,
      maxlength: 2048,
    },
    isVerified: {type: Boolean, default: false},
    verificationToken: {type: String},
    loginResetToken: {type: String},
  },
  {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}}
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
