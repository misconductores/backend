const {GeneralErrorsFactory, ConnectionErrors} = require('../factories');
const {ConnectionsModel} = require('../models');

module.exports = async (req, res, next) => {
  try {
    const userId = req.jwtToken.user.id;

    const {driverId} = req.body;

    const findConnectionQuery = {
      companyId: userId,
      driverId: driverId,
      isActive: true,
    };

    const findConnection = await ConnectionsModel.findOne(findConnectionQuery);

    if (findConnection)
      return next(ConnectionErrors.alreadyConnectedWithYouErr());

    next();
  } catch (error) {
    return next(GeneralErrorsFactory.internalErr({error}));
  }
};
