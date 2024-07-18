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
