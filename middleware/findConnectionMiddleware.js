const {roles} = require('../constants/usersConstants');
const {GeneralErrorsFactory, ConnectionErrors} = require('../factories');
const {ConnectionsModel} = require('../models');
const {GeneralServices} = require('../services');

module.exports = async (req, res, next) => {
  try {
    const userId = req.jwtToken.user.id;
    const role = req.jwtToken.user.role;
    const data = req.body;

    let connectionQuery = {};

    if (role === roles.driver.value) {
      connectionQuery = {
        $and: [
          {companyId: data.companyId},
          {driverId: userId},
          {isActive: true},
        ],
      };
    } else {
      connectionQuery = {
        $and: [
          {driverId: data.driverId},
          {companyId: userId},
          {isActive: true},
        ],
      };
    }

    const {doc: connection} = await GeneralServices.findOne({
      query: connectionQuery,
      model: ConnectionsModel,
    });

    if (!connection) return next(ConnectionErrors.noConnectionErr());

    req.connection = connection;

    next();
  } catch (error) {
    return next(GeneralErrorsFactory.internalErr({error}));
  }
};
