const {
  statusTypes,
  connectionStatuses,
  roles,
} = require('../constants/usersConstants');
const {GeneralErrorsFactory} = require('../factories');
const {DocumentAccessModel, ConnectionsModel} = require('../models');
const {GeneralServices} = require('../services');

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

    // If no document access, check the connection status
    const {doc: connection} = await GeneralServices.findOne({
      query: {
        companyId: loggedInUserId,
        driverId: relatedUserId,
        status: connectionStatuses.active.value,
      },
      model: ConnectionsModel,
    });

    if (connection) {
      return next();
    }

    return next(GeneralErrorsFactory.forbiddenRoleErr());
  } catch (error) {
    return next(GeneralErrorsFactory.internalErr({error}));
  }
};
