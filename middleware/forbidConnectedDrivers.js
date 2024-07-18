const {GeneralErrorsFactory, ConnectionErrors} = require('../factories');
const {ConnectionsServices} = require('../services');

module.exports = async (req, res, next) => {
  try {
    const userId = req.jwtToken.user.id;

    const findConnectionQuery = {
      driverId: userId,
      isActive: true,
    };

    const {connection: findConnection} =
      await ConnectionsServices.findConnection({
        query: findConnectionQuery,
      });

    if (findConnection) return next(ConnectionErrors.alreadyConnectedErr());

    next();
  } catch (error) {
    return next(GeneralErrorsFactory.internalErr({error}));
  }
};
