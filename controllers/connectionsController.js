const {ConnectionsResponsesFactory, ConnectionErrors} = require('../factories');
const {ConnectionsServices} = require('../services');

module.exports = class ConnectionsController {
  static async disconnectByDriver(req, res, next) {
    const userId = req.jwtToken.user.id;
    const data = req.body;

    const {success, error} = await ConnectionsServices.disconnectByDriver({
      data,
      userId,
    });

    if (success)
      return next(ConnectionsResponsesFactory.disconnectSuccessfully());

    if (error) throw error;
  }

  static async disconnectByCompany(req, res, next) {
    const userId = req.jwtToken.user.id;
    const data = req.body;

    const {success, error} = await ConnectionsServices.disconnectByCompany({
      data,
      userId,
    });

    if (success)
      return next(ConnectionsResponsesFactory.disconnectSuccessfully());

    if (error) throw error;
  }

  static async getConnectedCompany(req, res, next) {
    const userId = req.jwtToken.user.id;

    const {success, connection, error} =
      await ConnectionsServices.getConnectedCompany({userId});

    if (success && connection)
      return next(
        ConnectionsResponsesFactory.connectionRetrievedSuccessfully({
          connection,
        })
      );

    if (!success) return next(ConnectionErrors.noConnectionErr());

    if (error) throw error;
  }

  static async getCompanyDrivers(req, res, next) {
    const userId = req.jwtToken.user.id;

    let {page, limit, status} = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const {success, drivers, error} =
      await ConnectionsServices.getCompanyDrivers({
        page,
        limit,
        userId,
        status,
      });

    if (success)
      return next(
        ConnectionsResponsesFactory.companyDriversRetrievedSuccessfully({
          count: drivers.totalCount,
          data: drivers.data,
          page: page,
          perPage: limit,
        })
      );

    if (error) throw error;
  }

  static async getDriverJobHistory(req, res, next) {
    const userId = req.jwtToken.user.id;

    const {success, error, history} =
      await ConnectionsServices.getDriverJobHistory({userId});

    if (success)
      return next(
        ConnectionsResponsesFactory.jobHistoryRetrievedSuccessfully({history})
      );

    if (error) throw error;
  }
};
