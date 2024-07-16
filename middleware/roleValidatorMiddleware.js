const {GeneralErrorsFactory} = require('../factories');

module.exports =
  ({allowedRoles}) =>
  async (req, res, next) => {
    try {
      const role = req.jwtToken.user.role;

      if (!role || !allowedRoles.includes(role))
        return next(GeneralErrorsFactory.forbiddenRoleErr());

      next();
    } catch (error) {
      return next(GeneralErrorsFactory.internalErr({error}));
    }
  };
