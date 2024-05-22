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
  static async getDriverList({page, limit, title, location}) {
    const query = {
      role: roles.driver.value,
    };

    if (title) {
      query.$or = [
        {firstName: {$regex: title, $options: 'i'}},
        {lastName: {$regex: title, $options: 'i'}},
      ];
    }

    if (location) {
      query.city = {$regex: location, $options: 'i'};
    }

    try {
      const totalCount = await UsersModel.find(query).countDocuments();
      const skip = (page - 1) * limit;
      const data = await UsersModel.find(query, null, {
        skip,
        limit,
      });
      return {success: true, result: {totalCount, data}};
    } catch (err) {
      return {success: false, err};
    }
  }
  static async getCompanyList({page, limit, title, location}) {
    try {
      const query = {
        role: roles.company.value,
      };

      if (title) {
        query.companyName = {$regex: title, $options: 'i'};
      }

      if (location) {
        query.city = {$regex: location, $options: 'i'};
      }

      let finalList = [];
      const totalCount = await UsersModel.find(query).countDocuments();
      const skip = (page - 1) * limit;
      const data = await UsersModel.find(query, null, {
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
