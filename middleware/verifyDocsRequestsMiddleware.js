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

    const {doc: documentsRequest} = await GeneralServices.findOne({
      query: {
        companyId: loggedInUserId,
        driverId: relatedUserId,
        status: statusTypes.accepted.value,
      },
      model: DocumentAccessModel,
    });

    const {doc: connection} = await GeneralServices.findOne({
      query: {
        companyId: loggedInUserId,
        driverId: relatedUserId,
        status: connectionStatuses.active.value,
      },
      model: ConnectionsModel,
    });

    if (documentsRequest || role === roles.admin.value || connection) {
      next();
    } else {
      return next(GeneralErrorsFactory.forbiddenRoleErr());
    }
  } catch (error) {
    return next(GeneralErrorsFactory.internalErr({error}));
  }
};
