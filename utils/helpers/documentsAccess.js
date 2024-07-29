const {roles, documentRequestTypes} = require('../../constants/usersConstants');
const {getCurrentDate} = require('../DateCalculations');

exports.findDocumentsAccess = ({driverId, companyId, userId, role}) => {
  let query = {
    $or: [{endDate: {$gte: getCurrentDate()}}, {endDate: null}],
  };

  if (role === roles.driver.value) {
    query = {
      ...query,
      driverId: userId,
      companyId: companyId,
      type: documentRequestTypes.driver_request.value,
    };
  } else {
    query = {
      ...query,
      driverId: driverId,
      companyId: userId,
      type: documentRequestTypes.company_request.value,
    };
  }

  return query;
};
