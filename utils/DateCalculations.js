const {DateTime} = require('luxon');

exports.getCurrentDate = () => {
  const currentDate = DateTime.now();
  return currentDate;
};

exports.getDate7DaysAgo = () => {
  const currentDate = DateTime.now();
  const expiryDate = currentDate.minus({days: 7}).toJSDate();
  return expiryDate;
};
