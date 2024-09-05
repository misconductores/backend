const mongoose = require('mongoose');

exports.getWithoutMatchCountPipeline = ({jobId}) => {
  return [
    {
      $match: {
        jobId: new mongoose.Types.ObjectId(jobId),
      },
    },
    {
      $count: 'count',
    },
  ];
};

exports.getCommonJobPipeline = ({searchTerm, jobId}) => [
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
    $match: {
      driverDetails: {$ne: []}, // Ensure there is at least one matching driverDetail
      jobId: new mongoose.Types.ObjectId(jobId),
    },
  },
];

exports.getJobLookupAndProjectStages = ({skip, limit}) => [
  {
    $lookup: {
      from: 'jobs',
      localField: 'jobId',
      foreignField: '_id',
      as: 'jobDetails',
    },
  },
  {
    $unwind: {
      path: '$jobDetails',
      preserveNullAndEmptyArrays: false, // Ensures that documents with no matches are not included
    },
  },
  {
    $project: {
      'driverDetails.firstName': 1,
      'driverDetails.lastName': 1,
      'driverDetails._id': 1,
      jobId: 1,
      'jobDetails.title': 1,
      status: 1,
    },
  },
  {$skip: parseInt(skip)},
  {$limit: parseInt(limit)},
];
