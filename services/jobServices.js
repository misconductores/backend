const {roles} = require('../constants/usersConstants');
const {UpdateById} = require('../factories/MongoFactories');
const JobModel = require('../models/JobModel');
const UsersModel = require('../models/UsersModel');

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
  static async getDriverList({page, limit}) {
    try {
      const totalCount = await UsersModel.find({
        role: roles.driver.value,
      }).countDocuments();
      const skip = (page - 1) * limit;
      const data = await UsersModel.find({role: roles.driver.value}, null, {
        skip,
        limit,
      });
      return {success: true, result: {totalCount, data}};
    } catch (err) {
      return {success: false, err};
    }
  }
  static async getCompanyList({page, limit}) {
    try {
      let finalList = [];
      const totalCount = await UsersModel.find({
        role: roles.company.value,
      }).countDocuments();
      const skip = (page - 1) * limit;
      const data = await UsersModel.find({role: roles.company.value}, null, {
        skip,
        limit,
      });
      for (const user of data) {
        const jobs = await JobModel.find({companyId: user._id});
        let finalObject = {company: user, jobs};
        finalList.push(finalObject);
      }
      return {success: true, result: {totalCount, data: finalList}};
    } catch (err) {
      return {success: false, err};
    }
  }
};
