const {JobController} = require('../controllers');
const {authMiddleware, validatorMiddleware} = require('../middleware');
const {jobSchema} = require('../schemas');
const {catchAsync} = require('../utils');

const router = require('express').Router();

router.get('/list', authMiddleware);
router.get('/:id', authMiddleware);
router.post(
  '/create',
  authMiddleware,
  validatorMiddleware(jobSchema.validateJobCreateReq),
  catchAsync(JobController.createJob)
);
router.patch('/:id', authMiddleware);
router.delete('/:id', authMiddleware);

module.exports = router;
