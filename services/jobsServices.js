const {UpdateById} = require('../factories/MongoFactories');
const JobModel = require('../models/JobModel');

module.exports = class JobServices {
  static async getJobList({page, limit, title, location}) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      if (title) {
        query.$or = [
          {title: {$regex: title, $options: 'i'}},
          {description: {$regex: title, $options: 'i'}},
        ];
      }

      if (location) {
        query.location = {$regex: location, $options: 'i'};
      }

      const [totalCount, data] = await Promise.all([
        JobModel.countDocuments(query),
        JobModel.find(query, null, {skip, limit}).populate('companyId'),
      ]);

      return {success: true, result: {totalCount, data}};
    } catch (err) {
      return {success: false, err};
    }
  }

  static async getCompanyJobList({page, limit, id}) {
    try {
      const skip = (page - 1) * limit;
      const [totalCount, data] = await Promise.all([
        JobModel.countDocuments({companyId: id}),
        JobModel.find({companyId: id}, null, {skip, limit}).populate(
          'companyId'
        ),
      ]);
      return {success: true, result: {totalCount, data}};
    } catch (err) {
      return {success: false, err};
    }
  }
};
