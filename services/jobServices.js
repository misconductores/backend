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
};
