const mongoose = require('./mongoose');
const UsersModel = require(`./UsersModel`);
const DocumentsModel = require('./DocumentsModel');
const PostalCodeModel = require('./PostalCodeModel');
const NotificationsModel = require('./NotificationsModel');
const ConnectionsModel = require('./ConnectionsModel');
const OffersModel = require('./OffersModel');
const ReviewsModel = require('./ReviewsModel');
const DocumentAccessModel = require('./DocumentAccessModel');
const ApplicantsModel = require('./ApplicantsModel');

module.exports = {
  mongoose,
  UsersModel,
  DocumentsModel,
  PostalCodeModel,
  NotificationsModel,
  ConnectionsModel,
  OffersModel,
  ReviewsModel,
  DocumentAccessModel,
  ApplicantsModel,
};
