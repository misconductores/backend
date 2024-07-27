const {roles, QUERY_PROPERTY} = require('../constants/usersConstants');
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

module.exports = router;
