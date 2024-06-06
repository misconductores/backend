exports.getJobsPipeline = ({query, postalCode, skip, limit}) => [
  {$match: query},
  {
    $addFields: {
      postalCodeMatch: postalCode
        ? {$cond: [{$eq: ['$postalCode', postalCode]}, 1, 0]}
        : 0,
    },
  },
  {$sort: {postalCodeMatch: -1, createdAt: -1}},
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
