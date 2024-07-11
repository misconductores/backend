const {GeneralErrorsFactory} = require('../factories');
const {UsersServices} = require('../services');

module.exports = (allowedRoles) => async (req, res, next) => {
  const {user} = await UsersServices.getUserById({
    id: req.jwtToken.user.id,
  });

  if (!user || !allowedRoles.includes(user.role))
    return next(GeneralErrorsFactory.forbiddenRoleErr());

  next();
};
