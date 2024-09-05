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
