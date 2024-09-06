const {UsersModel} = require('../../models');

exports.addGetJobsConditions = ({
  title,
  location,
  equipment,
  experience,
  federalLicenseTypes,
  stateLicenseTypes,
  vehicleType,
}) => {
  let query = {};
  if (title) {
    title = title.trim();
    const titleWords = title.split(' ').filter((word) => word.length > 0);
    const titleConditions = titleWords.map((word) => ({
      $or: [
        {title: {$regex: word, $options: 'i'}},
        {description: {$regex: word, $options: 'i'}},
      ],
    }));
    query.$and = titleConditions;
  }

  if (location) {
    query.city = location;
  }

  if (vehicleType) {
    query.vehicleType = vehicleType;
  }

  if (federalLicenseTypes && federalLicenseTypes.length > 0) {
    query.federalLicenseTypes = {$in: federalLicenseTypes};
  }

  if (stateLicenseTypes && stateLicenseTypes.length > 0) {
    query.stateLicenseTypes = {$in: stateLicenseTypes};
  }

  if (equipment && equipment.length > 0) {
    query.handledEquipment = {$in: equipment};
  }

  if (experience && experience.length > 0) {
    query.experience = {$in: experience};
  }

  return query;
};
