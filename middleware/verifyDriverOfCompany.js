const {connectionStatuses} = require('../constants/usersConstants');
const {GeneralErrorsFactory} = require('../factories');
const {ConnectionsModel} = require('../models');
const {GeneralServices} = require('../services');

module.exports = async (req, res, next) => {
  try {
    const userId = req.jwtToken.user.id;
    const {id: driverId} = req.params;

    const findConnectionQuery = {
      companyId: userId,
      driverId: driverId,
      status: connectionStatuses.active.value,
    };

    const {doc: connection} = await GeneralServices.findOne({
      query: findConnectionQuery,
      model: ConnectionsModel,
    });

    // if requested driver is connected with loggedIn company then it returns true otherwise false
    req.isCompanyDriver = !!connection;
    next();
  } catch (error) {
    return next(GeneralErrorsFactory.internalErr({error}));
  }
};
