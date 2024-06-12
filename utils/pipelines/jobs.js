exports.getJobsPipeline = ({query, postalCode, userCity, skip, limit}) => {
  if (postalCode && !query.city) {
    return [
      {$match: query},
      {
        $addFields: {
          postalCodeMatch: postalCode
            ? {$cond: [{$eq: ['$postalCode', postalCode]}, 1, 0]}
            : 0,
          userCityMatch: userCity
            ? {$cond: [{$eq: ['$city', userCity]}, 1, 0]}
            : 0,
        },
      },
      {$sort: {postalCodeMatch: -1, userCityMatch: -1, createdAt: -1}},
      {$skip: skip},
      {$limit: limit},
      {
        $lookup: {
          from: 'users',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company',
        },
      },
      {$unwind: '$company'},
    ];
  } else {
    return [
      {$match: query},
      {$sort: {createdAt: -1}},
      {$skip: skip},
      {$limit: limit},
      {
        $lookup: {
          from: 'users',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company',
        },
      },
      {$unwind: '$company'},
    ];
  }
};
