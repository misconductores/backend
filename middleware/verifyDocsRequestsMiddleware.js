const {
  statusTypes,
  connectionStatuses,
  roles,
  subscriptionModes,
} = require('../constants/usersConstants');
const {GeneralErrorsFactory} = require('../factories');
const {
  DocumentAccessModel,
  ConnectionsModel,
  SubscriptionsModel,
} = require('../models');
const {GeneralServices} = require('../services');
const {
  getCurrentDate,
  getDateAfter1Year,
} = require('../utils/DateCalculations');

module.exports = async (req, res, next) => {
  try {
    const {id: loggedInUserId, role} = req.jwtToken.user;
    const {userId: relatedUserId} = req.params;

    // If the user is an admin, immediately proceed
    if (role === roles.admin.value) {
      req.hasAccess = true;
      return next();
    }

    const {doc: subscription} = await GeneralServices.findOne({
      query: {
        userId: loggedInUserId,
      },
      model: SubscriptionsModel,
    });

    if (subscription?.subscriptionMode === subscriptionModes.free.value) {
      req.hasAccess = false;
      return next();
    }

    // Check for document access request first (assuming higher probability)
    const {doc: documentsRequest} = await GeneralServices.findOne({
      query: {
        companyId: loggedInUserId,
        driverId: relatedUserId,
        status: statusTypes.accepted.value,
      },
      model: DocumentAccessModel,
    });

    if (documentsRequest) {
      req.hasAccess = true;
      return next();
    }

    // if driver is disconnected then company can view its document for 1 year after disconnection
    const connections = await ConnectionsModel.find({
      companyId: loggedInUserId,
      driverId: relatedUserId,
    }).sort({createdAt: -1});

    if (connections.length > 0) {
      const currentDate = getCurrentDate();
      const dateAfter1Year = getDateAfter1Year({date: connections[0].endDate});

      if (
        connections[0].status !== connectionStatuses.inactive.value ||
        currentDate <= dateAfter1Year
      ) {
        req.hasAccess = true;
        return next();
      }
    }

    req.hasAccess = false;
    return next();
  } catch (error) {
    return next(GeneralErrorsFactory.internalErr({error}));
  }
};
