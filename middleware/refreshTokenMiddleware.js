const config = require('config');

const {AppError} = require('../factories');
const {jwtUtils, isEnvDev} = require('../utils');
const {generalConstant} = require('../constants');
const {roles} = require('../constants/usersConstants');

module.exports = (data, req, res, next) => {
  if (data instanceof AppError) return next(data);

  const jwtData = req.jwtToken;

  // If there is no jwt token and is not login requested
  if (!jwtData && !data.body.isLoginRequest) return next(data);

  const userObj = jwtData ? jwtData.user : data.body.user;

  // Prepare the jwt token
  const payload = {
    user: {
      id: userObj.id,
      role: userObj.role,
      fullName:
        userObj.role === roles.driver.value
          ? `${userObj.firstName} ${userObj.lastName}`
          : userObj.companyName,
      email: userObj.email,
    },
  };
  const token = jwtUtils.generateToken({payload});

  // Setting cookies
  const cookiesOpts = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: generalConstant.cookieExpirationTime,
  };
  res.cookie(config.get('tokenVariable'), token, cookiesOpts);

  delete data.body.isLoginRequest; // This is only used for creating jwt, no need to send it to the client

  return next(data);
};
