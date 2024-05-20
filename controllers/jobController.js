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
};
