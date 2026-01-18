const mongoose = require('mongoose');
const {
  getCommonJobPipeline,
  getJobLookupAndProjectStages,
} = require('./common');

exports.getWithoutMatchOffersPipeline = ({jobId, skip, limit}) => {
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
      },
    },
    ...getJobLookupAndProjectStages({skip, limit}),
  ];
};

exports.getMatchOffersPipeline = ({searchTerm, jobId, limit, skip}) => {
  return [
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
    {
      $addFields: {
        driverDetails: {$arrayElemAt: ['$driverDetails', 0]}, // Convert driverDetails array to object
      },
    },
    ...getJobLookupAndProjectStages({skip, limit}),
  ];
};

exports.getMatchOffersCountPipeline = ({searchTerm, jobId}) => [
  ...getCommonJobPipeline({searchTerm, jobId}),
  {$count: 'count'},
];
