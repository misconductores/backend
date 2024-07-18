const {ConnectionsModel} = require('../models');
const {getCurrentDate} = require('../utils/DateCalculations');

module.exports = class ConnectionsServices {
  static async findConnection({query}) {
    try {
      const connection = await ConnectionsModel.findOne(query).populate({
        path: 'driverId companyId',
        select: 'firstName lastName companyName profilePic',
      });
      return {success: true, connection};
    } catch (err) {
      return {success: false, err};
    }
  }

  static async createConnection({driverId, companyId, offerId, session}) {
    try {
      const newConnection = await ConnectionsModel.create(
        [{driverId, companyId, offerId, startDate: getCurrentDate()}],
        {session}
      );
      return {success: true, newConnection: newConnection[0]};
    } catch (err) {
      return {success: false, err};
    }
  }
};
