const mongoose = require('mongoose');

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
        'driverDetails._id': 1, // Include the driver's _id
        jobId: 1,
        'jobDetails.title': 1,
        status: 1,
      },
    },
    {$skip: parseInt(skip)},
    {$limit: parseInt(limit)},
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
        'driverDetails._id': 1, // Include the driver's _id
        jobId: 1,
        'jobDetails.title': 1,
        status: 1,
      },
    },
    {$skip: parseInt(skip)},
    {$limit: parseInt(limit)},
  ];
};

exports.getMatchOffersCountPipeline = ({searchTerm, jobId}) => {
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
      $count: 'count',
    },
  ];
};
