const {
  statusTypes,
  connectionStatuses,
  roles,
} = require('../constants/usersConstants');
const {GeneralErrorsFactory} = require('../factories');
const {DocumentAccessModel, ConnectionsModel} = require('../models');
const {GeneralServices} = require('../services');
const {getCurrentDate, getDate1YearAgo} = require('../utils/DateCalculations');

module.exports = async (req, res, next) => {
  try {
    const {id: loggedInUserId, role} = req.jwtToken.user;
    const {userId: relatedUserId} = req.params;

    // If the user is an admin, immediately proceed
    if (role === roles.admin.value) {
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
      return next();
    }

    // if driver is disconnected then company can view its document for 1 year after disconnection
    const connections = await ConnectionsModel.find({
      companyId: loggedInUserId,
      driverId: relatedUserId,
    }).sort({createdAt: -1});

    const currentDate = getCurrentDate();
    const dateAfter1Year = getDate1YearAgo({date: connections[0].endDate});

    if (
      connections[0].status === connectionStatuses.active.value ||
      currentDate <= dateAfter1Year
    ) {
      return next();
    }

    return next(GeneralErrorsFactory.forbiddenRoleErr());
  } catch (error) {
    return next(GeneralErrorsFactory.internalErr({error}));
  }
};
