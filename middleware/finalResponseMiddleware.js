module.exports = (data, req, res, next) => {
  const header = {
    'Content-Type': 'application/json',
  };

	const statusCode = typeof data.statusCode === 'number' && data.statusCode >= 100 && data.statusCode < 600 ? data.statusCode : 500;
	return res.status(statusCode).set(header).json(data);
};
