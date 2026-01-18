const {GeneralErrorsFactory} = require('../factories');
const logger = require('../middleware/loggerMiddleware');

module.exports = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    logger.error(err);
    next(GeneralErrorsFactory.internalErr({err}));
  }
};
