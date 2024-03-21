class AppError extends Error {
  constructor({message, statusCode, err = null} = {}) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isKnown = true;
    this.internalErr = err;
  }
}
module.exports = AppError;
