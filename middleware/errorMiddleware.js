const {AppError} = require('../factories');

module.exports = (data, req, res, next) => {
  if (!(data instanceof AppError)) return next(data);

  data.statusCode = data.statusCode || 500;
  data.status = data.status ?? 'error';

  data.message =
    data.statusCode === 500 ? 'Something went wrong' : data.message;

  const errData = {
    statusCode: data.statusCode,
    message: data.message,
    err: data.internalErr?.type ? data.internalErr : undefined,
  };

  return next(errData);
};
