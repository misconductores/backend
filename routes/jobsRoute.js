const {
  QUERY_PROPERTY,
  PARAMS_PROPERTY,
} = require('../constants/usersConstants');
const {JobsController} = require('../controllers');
const {
  authMiddleware,
  validatorMiddleware,
  isApplicantExist,
} = require('../middleware');
const {jobsSchema, othersSchema} = require('../schemas');
const {catchAsync} = require('../utils');

const router = require('express').Router();

router.get(
  '/list',
  authMiddleware,
  validatorMiddleware(othersSchema.validatePaginationParams, QUERY_PROPERTY),
  catchAsync(JobsController.getJobList)
);

router.get(
  '/list/company-jobs',
  authMiddleware,
  validatorMiddleware(othersSchema.validatePaginationParams, QUERY_PROPERTY),
  catchAsync(JobsController.getCompanyJobList)
);

router.get(
  '/:id',
  authMiddleware,
  validatorMiddleware(jobsSchema.validateJobIdParams, PARAMS_PROPERTY),
  catchAsync(JobsController.getJobById)
);
router.post(
  '/create',
  authMiddleware,
  validatorMiddleware(jobsSchema.validateJobReq),
  catchAsync(JobsController.createJob)
);
router.patch(
  '/:id',
  authMiddleware,
  validatorMiddleware(jobsSchema.validateJobReq),
  catchAsync(JobsController.updateJobById)
);
router.delete(
  '/:id',
  authMiddleware,
  validatorMiddleware(jobsSchema.validateJobIdParams, PARAMS_PROPERTY),
  catchAsync(JobsController.deleteJobById)
);

router.post(
  '/:id/apply-job',
  authMiddleware,
  validatorMiddleware(jobsSchema.validateJobIdParams, PARAMS_PROPERTY),
  isApplicantExist,
  catchAsync(JobsController.applyForJob)
);

module.exports = router;
