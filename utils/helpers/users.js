const {restrictedUserData} = require('../../constants/usersConstants');

exports.addDriverConditions = ({
  query,
  title,
  location,
  equipment,
  experience,
  federalLicenseTypes,
  stateLicenseTypes,
  vehicleType,
}) => {
  let andConditions = [];

  if (title) {
    title = title.trim();
    const titleWords = title.split(' ').filter((word) => word.length > 0);
    const titleConditions = titleWords.map((word) => ({
      $or: [
        {firstName: {$regex: word, $options: 'i'}},
        {lastName: {$regex: word, $options: 'i'}},
      ],
    }));
    andConditions.push(...titleConditions);
  }

  if (experience && experience.length > 0) {
    query.experience = {$in: experience};
  }

  if (location) {
    query.city = location;
  }

  if (equipment && equipment.length > 0) {
    query.handleEquipment = {$in: equipment};
  }

  if (vehicleType) {
    query.vehicleType = vehicleType;
  }

  if (federalLicenseTypes && federalLicenseTypes.length > 0) {
    andConditions.push({
      federalLicenses: {
        $elemMatch: {
          federalLicenseType: {$in: federalLicenseTypes},
        },
      },
    });
  }

  if (stateLicenseTypes && stateLicenseTypes.length > 0) {
    andConditions.push({
      stateLicenses: {
        $elemMatch: {
          stateLicenseType: {$in: stateLicenseTypes},
        },
      },
    });
  }

  return andConditions;
};

exports.calculateRestrictedData = ({isCompanyDriver}) => {
  // if driver is connected with loggedIn company then allow visa number and fast number to be display
  let connectedDriverData = restrictedUserData
    .replace('-visaNumber ', '')
    .replace('-fastNumber ', '');
  return isCompanyDriver ? connectedDriverData : restrictedUserData;
};
