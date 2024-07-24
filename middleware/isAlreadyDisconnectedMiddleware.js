const {roles, reviewTypes} = require('../constants/usersConstants');
const {GeneralErrorsFactory, ReviewsErrors} = require('../factories');
const {ReviewsModel} = require('../models');
const {GeneralServices} = require('../services');

module.exports = async (req, res, next) => {
  try {
    const userId = req.jwtToken.user.id;
    const role = req.jwtToken.user.role;

    const {driverId, companyId} = req.body;

    let query = {};
    // this will act as a signal, it will check the review if review is present then it means user has been disconnected
    if (role === roles.driver.value) {
      query = {
        driverId: userId,
        companyId: companyId,
        type: reviewTypes.driver_review.value,
      };
    } else {
      query = {
        companyId: userId,
        driverId: driverId,
        type: reviewTypes.company_review.value,
      };
    }

    const {doc: findReview} = await GeneralServices.findOne({
      query,
      model: ReviewsModel,
    });

    if (findReview) return next(ReviewsErrors.alreadyReviewExistErr());

    next();
  } catch (error) {
    return next(GeneralErrorsFactory.internalErr({error}));
  }
};
