const {experienceTypes} = require('../../constants/usersConstants');

exports.addConditions = ({
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

  if (experience !== undefined) {
    if (experience === experienceTypes.student.value) {
      andConditions.push({
        experience: {$lte: 1},
      });
    } else if (experience === experienceTypes.beginner.value) {
      andConditions.push({
        experience: {$gt: 1, $lte: 4},
      });
    } else if (experience === experienceTypes.intermediate.value) {
      andConditions.push({
        experience: {$gt: 5, $lte: 9},
      });
    } else {
      andConditions.push({
        experience: {$gte: 10},
      });
    }
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
