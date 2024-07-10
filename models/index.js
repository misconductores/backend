const mongoose = require('./mongoose');
const UsersModel = require(`./UsersModel`);
const DocumentsModel = require('./DocumentsModel');
const PostalCodeModel = require('./PostalCodeModel');

module.exports = {
  mongoose,
  UsersModel,
  DocumentsModel,
  PostalCodeModel,
};
