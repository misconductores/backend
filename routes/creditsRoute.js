const { roles } = require('../constants/usersConstants');
const { CreditsController } = require('../controllers');
const { 
  authMiddleware, 
  roleValidatorMiddleware,
  validatorMiddleware 
} = require('../middleware');
const { creditsSchema } = require('../schemas');
const { catchAsync } = require('../utils');

const router = require('express').Router();
//no eliminar mis comentarios aun :)
router.get(
  '/packages',
  authMiddleware,
  roleValidatorMiddleware({
    allowedRoles: [roles.company.value],
  }),
  catchAsync(CreditsController.getPackages)
);

router.get(
  '/info',
  authMiddleware,
  roleValidatorMiddleware({
    allowedRoles: [roles.company.value],
  }),
  catchAsync(CreditsController.getUserCreditsInfo)
);

router.post(
  '/checkout',
  authMiddleware,
  roleValidatorMiddleware({
    allowedRoles: [roles.company.value], 
  }),
  validatorMiddleware(creditsSchema.validateCreateCheckoutSessionReq),
  catchAsync(CreditsController.createCheckoutSession)
);
router.post(
  '/deduct',
  authMiddleware,
  roleValidatorMiddleware({
    allowedRoles: [roles.company.value],
  }),
  catchAsync(CreditsController.deductCredit)
);

// Webhook para los creditos
router.post('/webhook', catchAsync(CreditsController.creditsWebhook));

module.exports = router;
