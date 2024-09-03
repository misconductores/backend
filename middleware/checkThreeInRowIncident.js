const {
  connectionStatuses,
  reasonToLeaveOptions,
} = require('../constants/usersConstants');
const {GeneralErrorsFactory} = require('../factories');
const {ConnectionsModel} = require('../models');

module.exports = async (req, res, next) => {
  try {
    const {driverId, reasonToLeave} = req.body;

    const isIncidentReason =
      reasonToLeave === reasonToLeaveOptions.incident.value;

    // if not a incident reason just move on
    if (!isIncidentReason) {
      req.isIncidentThreeTimesRow = false;
      return next();
    }

    // find those connections of driver which is disconnected by company so driverReviewId should not be null
    const connections = await ConnectionsModel.find({
      driverId,
      status: connectionStatuses.inactive.value,
      driverReviewId: {$ne: null},
    })
      .sort({endDate: -1})
      .populate({path: 'driverReviewId'});

    if (connections.length < 2) {
      req.isIncidentThreeTimesRow = false;
      return next();
    }

    // check is this driver already disconnected by companies due to incident reason
    const isIncidentTwoTimesRow = connections.every(
      (item) =>
        item.driverReviewId.reasonToLeave ===
        reasonToLeaveOptions.incident.value
    );

    // if already driver got incident review for two times and third time if it is again incident
    if (isIncidentTwoTimesRow) {
      req.isIncidentThreeTimesRow = isIncidentTwoTimesRow;
      return next();
    }
  } catch (error) {
    return next(GeneralErrorsFactory.internalErr({error}));
  }
};
