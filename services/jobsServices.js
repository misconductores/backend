const {restrictedUserData} = require('../constants/usersConstants');
const {ApplicantsModel, OffersModel, UsersModel} = require('../models');
const JobModel = require('../models/JobModel');
const {
  addGetJobsConditions,
  searchDriverData,
} = require('../utils/helpers/jobs');
const {getJobsPipeline} = require('../utils/pipelines/jobs');
const GeneralServices = require('./generalServices');
const mongoose = require('mongoose');

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

  static async getCompanyJobList({page, limit, id, title}) {
    try {
      const skip = (page - 1) * limit;
      let data = [];

      let query = {companyId: id};

      if (title) {
        query.title = {$regex: title, $options: 'i'};
      }

      const jobCount = await JobModel.countDocuments(query);

      const jobs = await JobModel.find(query, null, {skip, limit})
        .sort({createdAt: -1})
        .populate({path: 'companyId', select: 'companyName profilePic'});

      for (const job of jobs) {
        const offers = await OffersModel.countDocuments({jobId: job._id});
        const applicants = await ApplicantsModel.countDocuments({
          jobId: job._id,
        });
        let jobObj = job.toObject();

        jobObj.offers = offers;
        jobObj.applicants = applicants;

        data.push(jobObj);
      }

      return {success: true, result: {totalCount: jobCount, data}};
    } catch (err) {
      return {success: false, err};
    }
  }
  static async applyForJob({driverId, jobId}) {
    try {
      await GeneralServices.create({
        data: {driverId, jobId},
        model: ApplicantsModel,
      });

      await JobModel.findByIdAndUpdate(
        {_id: jobId},
        {$push: {applicants: driverId}},
        {new: true}
      );

      return {success: true};
    } catch (error) {
      return {success: false, error};
    }
  }

  static async getApplicantsByJobId({jobId, limit, page, searchTerm}) {
    try {
      const skip = (page - 1) * limit;

      let driverIds = await searchDriverData({searchTerm});

      const query = {jobId};

      // If driverIds were found, add them to the query
      if (driverIds.length > 0) {
        query.driverId = {$in: driverIds};
      } else if (searchTerm) {
        // If a searchTerm was provided but no drivers matched, return empty result
        return {success: true, result: {totalCount: 0, data: []}};
      }

      const [totalCount, data] = await Promise.all([
        ApplicantsModel.countDocuments(query),
        ApplicantsModel.find(query, null, {skip, limit}).populate({
          path: 'driverId',
          select: restrictedUserData,
        }),
      ]);

      return {success: true, result: {totalCount, data}};
    } catch (error) {
      return {success: false, error};
    }
  }
  static async deleteJobById({jobId}) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await JobModel.findByIdAndDelete({_id: jobId}, {session});

      await OffersModel.deleteMany({jobId: jobId}, {session});

      await ApplicantsModel.deleteMany({jobId: jobId}, {session});

      await session.commitTransaction();
      session.endSession();
      return {success: true};
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return {success: false, error};
    }
  }
};
