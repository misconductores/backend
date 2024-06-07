const JobModel = require('../models/JobModel');
const {getJobsPipeline} = require('../utils/pipelines/jobs');

module.exports = class JobServices {
  static async getJobList({page, limit, title, location, postalCode}) {
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
        query.city = location;
      }

      const pipeline = getJobsPipeline({
        query,
        postalCode,
        skip,
        limit,
      });

      const [totalCount, data] = await Promise.all([
        JobModel.countDocuments(query),
        JobModel.aggregate(pipeline),
      ]);

      return {success: true, result: {totalCount, data}};
    } catch (err) {
      console.error('Error:', err);
      return {success: false, err};
    }
  }

  static async getCompanyJobList({page, limit, id}) {
    try {
      const skip = (page - 1) * limit;
      const [totalCount, data] = await Promise.all([
        JobModel.countDocuments({companyId: id}),
        JobModel.find({companyId: id}, null, {skip, limit})
          .sort({createdAt: -1})
          .populate('companyId'),
      ]);
      return {success: true, result: {totalCount, data}};
    } catch (err) {
      return {success: false, err};
    }
  }
};
