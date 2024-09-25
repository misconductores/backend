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

exports.getRemainingDays = ({createdAt}) => {
  const createdDate = DateTime.fromJSDate(createdAt);
  const futureDate = createdDate.plus({days: 7});
  const now = DateTime.now();
  const remainingDays = futureDate.diff(now, 'days').days;
  return Math.max(0, Math.ceil(remainingDays));
};

module.exports.dateAfterSevenDays = () => {
  const date = DateTime.now();
  const after7Days = date.plus({days: 7});
  return after7Days;
};

module.exports.getDateAfter1Year = ({date = null}) => {
  const formattedDate = date ? DateTime.fromJSDate(date) : DateTime.now();
  const dateAfter1Year = formattedDate.plus({years: 1});
  return dateAfter1Year;
};

module.exports.getDateAfterOneMonth = () => {
  const currentDate = DateTime.now();
  const dateAfterOneMonth = currentDate.plus({months: 1});
  return dateAfterOneMonth;
};
