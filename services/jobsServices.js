const JobModel = require('../models/JobModel');
const {addGetJobsConditions} = require('../utils/helpers/jobs');
const {getJobsPipeline} = require('../utils/pipelines/jobs');

module.exports = class JobServices {
  static async getJobList({
    page,
    limit,
    title,
    location,
    postalCode,
    userCity,
    vehicleType,
    federalLicenseTypes,
    stateLicenseTypes,
    equipment,
    experience,
  }) {
    try {
      const skip = (page - 1) * limit;

      const query = addGetJobsConditions({
        title,
        location,
        equipment,
        experience,
        federalLicenseTypes,
        stateLicenseTypes,
        vehicleType,
      });

      const pipeline = getJobsPipeline({
        query,
        postalCode,
        userCity,
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
