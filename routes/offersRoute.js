const {authMiddleware} = require('../middleware');
const router = require('express').Router();

router.post('/', authMiddleware);

router.patch('/:id/accept', authMiddleware);

router.patch('/:id/reject', authMiddleware);

module.exports = router;
