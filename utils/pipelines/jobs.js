const mongoose = require('mongoose');

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

exports.getWithoutMatchApplicantsPipeline = ({jobId, skip, limit}) => {
  return [
    {
      $lookup: {
        from: 'users',
        localField: 'driverId',
        foreignField: '_id',
        as: 'driverDetails',
      },
    },
    {
      $unwind: {
        path: '$driverDetails',
        preserveNullAndEmptyArrays: false, // Ensures that documents with no matches are not included
      },
    },
    {
      $match: {
        jobId: new mongoose.Types.ObjectId(jobId), // Match the provided jobId
        isOfferReject: false,
      },
    },
    {
      $project: {
        'driverDetails.firstName': 1,
        'driverDetails.lastName': 1,
        'driverDetails.experience': 1,
        'driverDetails.postalCode': 1,
        'driverDetails.city': 1,
        'driverDetails._id': 1,
        jobId: 1,
        isOfferSent: 1,
      },
    },
    {$skip: parseInt(skip)},
    {$limit: parseInt(limit)},
  ];
};

exports.getMatchApplicantsPipeline = ({searchTerm, jobId, limit, skip}) => [
  {
    $lookup: {
      from: 'users',
      let: {driverId: '$driverId'},
      pipeline: [
        {
          $match: {
            $expr: {$eq: ['$_id', '$$driverId']},
            $or: [
              {firstName: {$regex: searchTerm, $options: 'i'}},
              {lastName: {$regex: searchTerm, $options: 'i'}},
            ],
          },
        },
      ],
      as: 'driverDetails',
    },
  },
  {
    $addFields: {
      driverDetails: {$arrayElemAt: ['$driverDetails', 0]}, // Extract the first element of the array
    },
  },
  {
    $match: {
      driverDetails: {$ne: null}, // Ensure there is at least one matching driverDetail
      jobId: new mongoose.Types.ObjectId(jobId),
      isOfferReject: false,
    },
  },
  {
    $project: {
      'driverDetails.firstName': 1,
      'driverDetails.lastName': 1,
      'driverDetails.experience': 1,
      'driverDetails.postalCode': 1,
      'driverDetails.city': 1,
      'driverDetails._id': 1,
      jobId: 1,
      isOfferSent: 1,
    },
  },
  {$skip: parseInt(skip)},
  {$limit: parseInt(limit)},
];

exports.getMatchApplicantsCountPipeline = ({searchTerm, jobId}) => [
  {
    $lookup: {
      from: 'users',
      let: {driverId: '$driverId'},
      pipeline: [
        {
          $match: {
            $expr: {$eq: ['$_id', '$$driverId']},
            $or: [
              {firstName: {$regex: searchTerm, $options: 'i'}},
              {lastName: {$regex: searchTerm, $options: 'i'}},
            ],
          },
        },
      ],
      as: 'driverDetails',
    },
  },
  {
    $addFields: {
      driverDetails: {$arrayElemAt: ['$driverDetails', 0]}, // Extract the first element of the array
    },
  },
  {
    $match: {
      driverDetails: {$ne: null}, // Ensure there is at least one matching driverDetail
      jobId: new mongoose.Types.ObjectId(jobId),
      isOfferReject: false,
    },
  },
  {$count: 'count'},
];

exports.getWithoutMatchApplicantsCountPipeline = ({jobId}) => {
  return [
    {
      $match: {
        jobId: new mongoose.Types.ObjectId(jobId),
        isOfferReject: false,
      },
    },
    {
      $count: 'count',
    },
  ];
};
