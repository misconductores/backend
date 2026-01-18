const jwt = require('jsonwebtoken');
const config = require('config');
const {generalConstant} = require('../constants');

module.exports.generateToken = ({payload, expiry}) => {
  const secret = config.get('jwtPrivateKey');
  const options = {expiresIn: expiry || generalConstant.tokenExpirationTime};

  const token = jwt.sign(payload, secret, options);
  return token;
};

module.exports.verifyToken = ({token}) => {
  try {
    const decodedObj = jwt.verify(token, config.get('jwtPrivateKey'));
    return decodedObj;
  } catch (err) {
    return false;
  }
};
