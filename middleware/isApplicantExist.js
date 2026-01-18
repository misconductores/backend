const {statusTypes} = require('../constants/usersConstants');
const {GeneralErrorsFactory, JobErrors} = require('../factories');
const {ApplicantsModel} = require('../models');

module.exports = async (req, res, next) => {
  try {
    const {id: jobId} = req.params;
    const driverId = req.jwtToken.user.id;

    const applicant = await ApplicantsModel.findOne({
      driverId,
      jobId,
    }).populate({path: 'offerId', select: 'status'});

    // if not applicant found the simply move toward controller
    if (!applicant) return next();

    // if offer is not present or if it is present then it should not be accepted or rejected
    // it means if offer is accepted or rejected then driver can apply for job again
    const isOfferPresentOrNot =
      !applicant.offerId ||
      (applicant.offerId.status !== statusTypes.accepted.value &&
        applicant.offerId.status !== statusTypes.rejected.value);

    if (applicant && isOfferPresentOrNot)
      return next(JobErrors.applicantAlreadyExist());

    next();
  } catch (error) {
    return next(GeneralErrorsFactory.internalErr({error}));
  }
};
