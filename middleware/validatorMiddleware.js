const {GeneralErrorsFactory} = require('../factories');

module.exports = (validateFunction, reqProperty) => async (req, res, next) => {
  try {
    const source = req[reqProperty];
    const {errors} = await validateFunction(source || req.body);
    if (errors)
      return next(GeneralErrorsFactory.badRequestErr({customMessage: errors}));

    next();
  } catch (err) {
    res.status(500).send(err);
  }
};
