const {
  roles,
  QUERY_PROPERTY,
  PARAMS_PROPERTY,
} = require('../constants/usersConstants');
const {ReviewsController} = require('../controllers');
const {
  authMiddleware,
  roleValidatorMiddleware,
  validatorMiddleware,
} = require('../middleware');
const {reviewsSchema} = require('../schemas');
const {catchAsync} = require('../utils');
const router = require('express').Router();

router.get(
  '/reviews-for-admin',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.admin.value]}),
  validatorMiddleware(reviewsSchema.validateGetAdminReviewsReq, QUERY_PROPERTY),
  catchAsync(ReviewsController.getReviewsForAdmin)
);

router.get(
  '/:userId/user-ratings',
  authMiddleware,
  validatorMiddleware(reviewsSchema.validateGetUserRatingsReq, PARAMS_PROPERTY),
  catchAsync(ReviewsController.getUserRatingsByUserId)
);

router.patch(
  '/:id/status',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.admin.value]}),
  validatorMiddleware(reviewsSchema.validateUpdateReviewStatusReq),
  catchAsync(ReviewsController.updateReviewStatus)
);

router.get(
  '/reviews-for-company',
  authMiddleware,
  roleValidatorMiddleware({allowedRoles: [roles.company.value]}),
  catchAsync(ReviewsController.getDriverReviewsForCompany)
);

module.exports = router;
