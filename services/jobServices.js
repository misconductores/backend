const {UpdateById} = require('../factories/MongoFactories');
const JobModel = require('../models/JobModel');

module.exports = class JobServices {
  static async createPost({data}) {
    try {
      const job = await JobModel.create(data);
      await job.save();
      return {success: true, job};
    } catch (err) {
      return {success: false, err};
    }
  }

  static async getJobList({page, limit}) {
    try {
      const totalCount = await JobModel.countDocuments();
      const skip = (page - 1) * limit;
      const data = await JobModel.find({}, null, {skip, limit}).populate(
        'companyId'
      );
      return {success: true, result: {totalCount, data}};
    } catch (err) {
      return {success: false, err};
    }
  }
  static async getJobById({id}) {
    try {
      const data = await JobModel.findById(id).populate('companyId');
      return {success: true, data};
    } catch (err) {
      return {success: false, err};
    }
  }
  static async updateJobById({id, data}) {
    try {
      const {doc, success} = await UpdateById(JobModel, id, data);
      if (success) return {success: true, updatedData: doc};
    } catch (err) {
      return {success: false, err};
    }
  }
  static async deleteJobById({id}) {
    try {
      const data = await JobModel.findByIdAndDelete(id);
      return {success: true, deletedData: data};
    } catch (err) {
      return {success: false, err};
    }
  }
};
