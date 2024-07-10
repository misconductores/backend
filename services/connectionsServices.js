const {DateTime} = require('luxon');
const {ConnectionsModel} = require('../models');
const GeneralServices = require('./generalServices');

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

  static async createConnection({driverId, companyId}) {
    try {
      const {doc: newConnection} = await GeneralServices.create({
        model: ConnectionsModel,
        data: {driverId, companyId, startDate: DateTime.now()},
      });

      const {connection} = await ConnectionsServices.findConnection({
        query: {_id: newConnection.id},
      });
      return {success: true, connection};
    } catch (err) {
      return {success: false, err};
    }
  }
};
