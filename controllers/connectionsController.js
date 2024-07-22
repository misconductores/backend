const {ConnectionsResponsesFactory} = require('../factories');
const {ConnectionsServices} = require('../services');

module.exports = class ConnectionsController {
  static async disconnectionByDriver(req, res, next) {
    const userId = req.jwtToken.user.id;
    const data = req.body;
    const connection = req.connection;

    const {success, error} = await ConnectionsServices.disconnectionByDriver({
      data,
      userId,
      connection,
    });

    if (success) next(ConnectionsResponsesFactory.disconnectSuccessfully());

    if (error) throw error;
  }

  static async disconnectionByCompany(req, res, next) {
    const userId = req.jwtToken.user.id;
    const data = req.body;
    const connection = req.connection;

    const {success, error} = await ConnectionsServices.disconnectionByCompany({
      data,
      userId,
      connection,
    });

    if (success) next(ConnectionsResponsesFactory.disconnectSuccessfully());

    if (error) throw error;
  }
};
