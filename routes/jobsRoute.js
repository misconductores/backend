const {
  QUERY_PROPERTY,
  PARAMS_PROPERTY,
} = require('../constants/usersConstants');
const {JobController} = require('../controllers');
const {authMiddleware, validatorMiddleware} = require('../middleware');
const {jobSchema} = require('../schemas');
const {catchAsync} = require('../utils');

const router = require('express').Router();

router.get(
  '/list',
  authMiddleware,
  validatorMiddleware(jobSchema.validateJobListQueries, QUERY_PROPERTY),
  catchAsync(JobController.getJobList)
);
router.get(
  '/:id',
  authMiddleware,
  validatorMiddleware(jobSchema.validatejobIdParams, PARAMS_PROPERTY),
  catchAsync(JobController.getJobById)
);
router.post(
  '/create',
  authMiddleware,
  validatorMiddleware(jobSchema.validateJobCreateReq),
  catchAsync(JobController.createJob)
);
router.patch('/:id', authMiddleware);
router.delete('/:id', authMiddleware);

module.exports = router;
