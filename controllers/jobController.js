const {roles} = require('../constants/usersConstants');
const {
  JobResponsesFactory,
  JobErrors,
  UsersErrorsFactory,
} = require('../factories');
const {JobServices, UsersServices} = require('../services');

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
      err: error,
      job,
    } = await JobServices.createPost({data});
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
    let {page, limit} = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const {
      success: response,
      result,
      err: error,
    } = await JobServices.getJobList({
      page,
      limit,
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
    if (!result || result.data.length === 0)
      return next(JobErrors.jobNotFoundErr());
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
      data,
      err: error,
    } = await JobServices.getJobById({
      id,
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
      updatedData,
      err: error,
    } = await JobServices.updateJobById({
      id,
      data,
    });
    if (response)
      return next(
        JobResponsesFactory.getJobByIdSuccessfully({
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
      deletedData,
      err: error,
    } = await JobServices.deleteJobById({
      id,
    });
    if (response && deletedData)
      return next(JobResponsesFactory.jobDeletedSuccessfully());
    if (error) throw next(JobErrors.jobDeleteErr());
  }
};
