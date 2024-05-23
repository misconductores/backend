const AppError = require('./AppError');
const GeneralErrorsFactory = require('./general');
const UsersErrorsFactory = require('../errors/users');
const AuthErrors = require('./AuthErrors');
const JobErrors = require('./jobs');
const OthersErrors = require('./others');

module.exports = {
  AppError,
  GeneralErrorsFactory,
  UsersErrorsFactory,
  AuthErrors,
  JobErrors,
  OthersErrors,
};
