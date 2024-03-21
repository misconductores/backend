const express = require('express');
const {accessMiddleware} = require('../middleware');

const router = express.Router();

const sampleAccessCustomFunction = (req) => {
  console.log('Checked sample access custom function', req.params);
};

router.post(
  '/sample',
  accessMiddleware({customFn: sampleAccessCustomFunction}),
  (req, res, next) => res.status(200).json({message: 'Public Sample'})
);

module.exports = router;
