const {statusTypes, roles} = require('../constants/usersConstants');
const {
  OffersModel,
  DocumentAccessModel,
  ConnectionsModel,
} = require('../models');

module.exports = class OthersServices {
  static async getCounters({role, userId}) {
    try {
      let pendingOffers = 0;
      let pendingDocsAccessRequests = 0;
      let pendingDriverConnection = 0;
      let pendingCompanyConnections = 0;

      if (role === roles.driver.value) {
        const [offers, docAccessRequests, connection] = await Promise.all([
          OffersModel.countDocuments({
            driverId: userId,
            status: statusTypes.pending.value,
          }),
          DocumentAccessModel.countDocuments({
            driverId: userId,
            status: statusTypes.pending.value,
          }),
          ConnectionsModel.countDocuments({
            driverId: userId,
            status: statusTypes.pending.value,
            driverReviewId: {$ne: null},
          }),
        ]);
        pendingOffers = offers;
        pendingDocsAccessRequests = docAccessRequests;
        pendingDriverConnection = connection;
      } else {
        pendingCompanyConnections = await ConnectionsModel.countDocuments({
          companyId: userId,
          status: statusTypes.pending.value,
          companyReviewId: {$ne: null},
        });
      }

      return {
        success: true,
        counters: {
          pendingOffers,
          pendingDocsAccessRequests,
          pendingDriverConnection,
          pendingCompanyConnections,
        },
      };
    } catch (error) {
      return {success: false, error};
    }
  }
};
