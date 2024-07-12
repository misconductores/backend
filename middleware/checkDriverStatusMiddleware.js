const {GeneralErrorsFactory} = require('../factories');
const {UsersServices} = require('../services');

module.exports = (driverStatuses) => async (req, res, next) => {
  try {
    const {user} = await UsersServices.getUserById({
      id: req.jwtToken.user.id,
    });

    if (driverStatuses.includes(user.driverStatus))
      return next(GeneralErrorsFactory.forbiddenDriverStatusErr());

    next();
  } catch (error) {
    res.status(500).send(err);
  }
};
