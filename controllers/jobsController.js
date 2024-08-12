const {roles} = require('../constants/usersConstants');
const {
  JobResponsesFactory,
  JobErrors,
  UsersErrorsFactory,
} = require('../factories');
const {JobsServices, UsersServices, GeneralServices} = require('../services');
const JobModel = require('../models/JobModel');
const {ApplicantsModel} = require('../models');

module.exports = class JobController {
  static async createJob(req, res, next) {
    const {success, err, user} = await UsersServices.getUserById({
      id: req.jwtToken.user.id,
    });
    if (!user) return next(UsersErrorsFactory.userNotFoundErr());
    if (user?.role !== roles.company.value)
      return next(UsersErrorsFactory.forbiddenCompanyErr());
    if (!success) throw err;

    let data = req.body;

    const {
      success: response,
      error,
      doc: job,
    } = await GeneralServices.create({data, model: JobModel});
    if (response) {
      return next(JobResponsesFactory.jobCreatedSuccessfully({job}));
    }
    if (error) {
      return next(JobErrors.jobCreateErr());
    }
  }
  static async getJobList(req, res, next) {
    const {success, err, user} = await UsersServices.getUserById({
      id: req.jwtToken.user.id,
    });
    if (!user) return next(UsersErrorsFactory.userNotFoundErr());
    if (!success) throw err;
    let {
      page,
      limit,
      title,
      location,
      postalCode,
      userCity,
      federalLicenseTypes,
      stateLicenseTypes,
      handleEquipment,
      vehicleType,
      experience,
    } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const formattedHandleEquipment = handleEquipment?.split(',') || [];
    const formattedFederalLicenseTypes = federalLicenseTypes?.split(',') || [];
    const formattedStateLicenseTypes = stateLicenseTypes?.split(',') || [];
    const formattedExperience = experience?.split(',') || [];

    const {
      success: response,
      result,
      err: error,
    } = await JobsServices.getJobList({
      page,
      limit,
      title,
      location,
      postalCode,
      userCity,
      vehicleType,
      federalLicenseTypes: formattedFederalLicenseTypes,
      stateLicenseTypes: formattedStateLicenseTypes,
      equipment: formattedHandleEquipment,
      experience: formattedExperience,
    });
    if (response)
      return next(
        JobResponsesFactory.jobRetrievedSuccessfully({
          count: result.totalCount,
          data: result.data,
          page: page,
          perPage: limit,
        })
      );
    if (!result) return next(JobErrors.jobNotFoundErr());
    if (error) throw error;
  }
  static async getCompanyJobList(req, res, next) {
    const {success, err, user} = await UsersServices.getUserById({
      id: req.jwtToken.user.id,
    });
    if (!user) return next(UsersErrorsFactory.userNotFoundErr());
    if (!success) throw err;
    let {page, limit} = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const {
      success: response,
      result,
      err: error,
    } = await JobsServices.getCompanyJobList({
      page,
      limit,
      id: user.id,
    });
    if (response)
      return next(
        JobResponsesFactory.jobRetrievedSuccessfully({
          count: result.totalCount,
          data: result.data,
          page: page,
          perPage: limit,
        })
      );
    if (!result) return next(JobErrors.jobNotFoundErr());
    if (error) throw error;
  }
  static async getJobById(req, res, next) {
    const {success, err, user} = await UsersServices.getUserById({
      id: req.jwtToken.user.id,
    });
    if (!user) return next(UsersErrorsFactory.userNotFoundErr());
    if (!success) throw err;
    const {id} = req.params;
    const {
      success: response,
      doc: data,
      error,
    } = await GeneralServices.findById({
      id,
      model: JobModel,
      popOptions: 'companyId',
    });
    if (response)
      return next(
        JobResponsesFactory.getJobByIdSuccessfully({
          job: data,
        })
      );
    if (!data) return next(JobErrors.jobByIdNotFoundErr());
    if (error) throw error;
  }
  static async updateJobById(req, res, next) {
    const {success, err, user} = await UsersServices.getUserById({
      id: req.jwtToken.user.id,
    });
    if (!user) return next(UsersErrorsFactory.userNotFoundErr());
    if (!success) throw err;
    if (user?.role !== roles.company.value)
      return next(UsersErrorsFactory.forbiddenCompanyErr());
    if (!success) throw err;
    const {id} = req.params;
    const data = req.body;
    const {
      success: response,
      doc: updatedData,
      error,
    } = await GeneralServices.update({
      id,
      model: JobModel,
      data,
    });
    if (response)
      return next(
        JobResponsesFactory.jobUpdatedSuccessfully({
          job: updatedData,
        })
      );
    if (error) throw next(JobErrors.jobUpdateErr());
  }
  static async deleteJobById(req, res, next) {
    const {success, err, user} = await UsersServices.getUserById({
      id: req.jwtToken.user.id,
    });
    if (!user) return next(UsersErrorsFactory.userNotFoundErr());
    if (!success) throw err;
    if (user?.role !== roles.company.value)
      return next(UsersErrorsFactory.forbiddenCompanyErr());
    if (!success) throw err;
    const {id} = req.params;
    const {
      success: response,
      doc: deletedData,
      error,
    } = await GeneralServices.delete({
      id,
      model: JobModel,
    });
    if (response && deletedData)
      return next(JobResponsesFactory.jobDeletedSuccessfully());
    if (error) throw next(JobErrors.jobDeleteErr());
  }

  static async applyForJob(req, res, next) {
    const driverId = req.jwtToken.user.id;

    const {id: jobId} = req.params;

    const {success, error} = await GeneralServices.create({
      data: {driverId, jobId},
      model: ApplicantsModel,
    });

    if (success) return next(JobResponsesFactory.applyForJobSuccessfully());

    if (error) throw error;
  }
};
