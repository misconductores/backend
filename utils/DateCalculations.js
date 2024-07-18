const {DateTime} = require('luxon');

exports.getCurrentDate = () => {
  const currentDate = DateTime.now();
  return currentDate;
};
