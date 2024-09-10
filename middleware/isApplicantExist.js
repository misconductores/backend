const {statusTypes} = require('../constants/usersConstants');
const {GeneralErrorsFactory, JobErrors} = require('../factories');
const {ApplicantsModel} = require('../models');

module.exports = async (req, res, next) => {
  try {
    const {id: jobId} = req.params;
    const driverId = req.jwtToken.user.id;

    const findApplicant = await ApplicantsModel.findOne({
      driverId,
      jobId,
    }).populate({path: 'offerId', select: 'status'});

    // if offer is not present or if it is present then it should not be accepted or rejected
    // it means if offer is accepted or rejected then driver can apply for job again
    const isOfferPresentOrNot =
      !findApplicant.offerId ||
      (findApplicant.offerId.status !== statusTypes.accepted.value &&
        findApplicant.offerId.status !== statusTypes.rejected.value);

    if (findApplicant && isOfferPresentOrNot)
      return next(JobErrors.applicantAlreadyExist());

    next();
  } catch (error) {
    return next(GeneralErrorsFactory.internalErr({error}));
  }
};
