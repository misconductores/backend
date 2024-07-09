const {authMiddleware} = require('../middleware');
const router = require('express').Router();

router.post('/', authMiddleware);

router.patch('/:id/accept-offer', authMiddleware);

router.patch('/:id/reject-offer', authMiddleware);

module.exports = router;
