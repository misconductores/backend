const usersSchema = require(`./usersSchema`);
const jobsSchema = require('./jobsSchema');
const othersSchema = require('./othersSchema');
const offersSchema = require('./offersSchema');
const reviewsSchema = require('./reviewsSchema');
const connectionsSchema = require('./connectionsSchema');
const documentAccessSchema = require('./documentsAccessSchema');
const notificationsSchema = require('./notifications');
const subscriptionsSchema = require('./subscriptionsSchema');
const backgroundCheckSchema = require('./backgroundCheckSchema');
const creditsSchema = require('./creditsSchema');

module.exports = {
  usersSchema,
  jobsSchema,
  othersSchema,
  offersSchema,
  reviewsSchema,
  connectionsSchema,
  documentAccessSchema,
  notificationsSchema,
  subscriptionsSchema,
  backgroundCheckSchema,
  creditsSchema,
};
