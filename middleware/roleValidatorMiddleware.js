const {GeneralErrorsFactory} = require('../factories');
const {UsersServices} = require('../services');

module.exports = (allowedRoles) => async (req, res, next) => {
  try {
    const {user} = await UsersServices.getUserById({
      id: req.jwtToken.user.id,
    });

    if (!user || !allowedRoles.includes(user.role))
      return next(GeneralErrorsFactory.forbiddenRoleErr());

    next();
  } catch (error) {
    res.status(500).send(err);
  }
};
