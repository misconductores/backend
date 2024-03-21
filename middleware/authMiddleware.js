const config = require('config');

const {GeneralErrorsFactory} = require('../factories');
const jwtUtils = require('../utils/jwtUtils');

module.exports = (req, res, next) => {
  const cookie = req.cookies[config.get('tokenVariable')];
  const token = jwtUtils.verifyToken({token: cookie});

  if (token) {
    req.jwtToken = token;
    next();
  } else {
    next(GeneralErrorsFactory.invalidTokenErr());
  }
};
