const {notificationTypes} = require('../constants/usersConstants');
const {DocumentsAccessResponsesFactory} = require('../factories');
const {DocumentAccessModel, NotificationsModel} = require('../models');
const {GeneralServices} = require('../services');
const {
  getCurrentDate,
  dateAfterSevenDays,
} = require('../utils/DateCalculations');

module.exports = class DocumentsAccessController {
  static async requestDocumentsAccess(req, res, next) {
    const userId = req.jwtToken.user.id;
    const {requestedUserId} = req.body;

    const {success, error} = await GeneralServices.create({
      data: {
        companyId: userId,
        driverId: requestedUserId,
        startDate: getCurrentDate(),
        endDate: dateAfterSevenDays(),
      },
      model: DocumentAccessModel,
    });

    if (success) {
      await GeneralServices.create({
        data: {
          userId: requestedUserId,
          relatedUser: userId,
          type: notificationTypes.company_document_access.value,
        },
        model: NotificationsModel,
      });
      return next(
        DocumentsAccessResponsesFactory.requestedDocumentsSuccessfully()
      );
    }

    if (error) throw error;
  }
};
