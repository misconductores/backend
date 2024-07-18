const {DateTime} = require('luxon');

exports.getCurrentDate = () => {
  const currentDate = DateTime.now();
  return currentDate;
};

exports.getExpiryDateAfter7Days = () => {
  const currentDate = DateTime.now();
  const expiryDate = currentDate.minus({days: 7}).toJSDate();
  return expiryDate;
};
