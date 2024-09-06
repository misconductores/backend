const {ApplicantsModel, OffersModel} = require('../models');
const JobModel = require('../models/JobModel');
const {addGetJobsConditions} = require('../utils/helpers/jobs');
const {
  getJobsPipeline,
  getWithoutMatchApplicantsPipeline,
  getMatchApplicantsPipeline,
  getMatchApplicantsCountPipeline,
  getWithoutMatchApplicantsCountPipeline,
} = require('../utils/pipelines/jobs');
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
          isOfferReject: false,
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

      // Choose pipelines based on the presence of searchTerm
      const pipeline = searchTerm
        ? getMatchApplicantsPipeline({limit, skip, jobId, searchTerm})
        : getWithoutMatchApplicantsPipeline({limit, skip, jobId});

      const countPipeline = searchTerm
        ? getMatchApplicantsCountPipeline({jobId, searchTerm})
        : getWithoutMatchApplicantsCountPipeline({jobId});

      const [data, totalCountResult] = await Promise.all([
        ApplicantsModel.aggregate(pipeline),
        ApplicantsModel.aggregate(countPipeline),
      ]);

      const totalCount = totalCountResult[0]?.count || 0;

      return {
        success: true,
        result: {totalCount, data},
      };
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
