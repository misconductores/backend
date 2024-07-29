const {roles, documentRequestTypes} = require('../../constants/usersConstants');

exports.findDocumentsAccess = ({driverId, companyId, userId, role}) => {
  let query = {
    endDate: {$lte: new Date()},
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
