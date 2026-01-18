const {GeneralErrorsFactory} = require('../factories');
const JobModel = require('../models/JobModel');
const {GeneralServices} = require('../services');

module.exports = async (req, res, next) => {
  try {
    const userId = req.jwtToken.user.id;

    const {jobId} = req.params;

    const findJobQuery = {
      _id: jobId,
      companyId: userId,
    };

    const {doc: job} = await GeneralServices.findOne({
      query: findJobQuery,
      model: JobModel,
    });

    if (!job) return next(GeneralErrorsFactory.forbiddenRoleErr());

    next();
  } catch (error) {
    return next(GeneralErrorsFactory.internalErr({error}));
  }
};
