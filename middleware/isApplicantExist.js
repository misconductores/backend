const {GeneralErrorsFactory, JobErrors} = require('../factories');
const {ApplicantsModel} = require('../models');
const {GeneralServices} = require('../services');

module.exports = async (req, res, next) => {
  try {
    const {id: jobId} = req.params;
    const {driverId} = req.body;

    const {doc: applicant} = await GeneralServices.findOne({
      query: {driverId, jobId},
      model: ApplicantsModel,
    });

    if (applicant) return next(JobErrors.applicantAlreadyExist());

    next();
  } catch (error) {
    return next(GeneralErrorsFactory.internalErr({error}));
  }
};
