const { roles } = require('../constants/usersConstants');
const { PaymentIntegrationController } = require('../controllers');
const { authMiddleware, roleValidatorMiddleware } = require('../middleware');
const { catchAsync } = require('../utils');

const router = require('express').Router();

router.post(
    '/payment-attempt',
    authMiddleware,
    roleValidatorMiddleware({
        allowedRoles: [roles.driver.value],
    }),
    catchAsync(PaymentIntegrationController.paymentAttempt)
);

router.post('/webhook', catchAsync(PaymentIntegrationController.webhook));

module.exports = router;
