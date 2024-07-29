const {
  roles,
  documentRequestTypes,
  notificationTypes,
  statusTypes,
} = require('../constants/usersConstants');
const {DocumentAccessModel, NotificationsModel} = require('../models');
const {getCurrentDate} = require('../utils/DateCalculations');
const GeneralServices = require('./generalServices');

module.exports = class DocumentsAccessServices {
  static async accessRequestForDocuments({role, driverId, companyId, userId}) {
    try {
      let data = {
        startDate: getCurrentDate(),
        status: statusTypes.pending.value,
      };

      if (role === roles.driver.value) {
        data = {
          ...data,
          driverId: userId,
          companyId: companyId,
          type: documentRequestTypes.driver_request.value,
        };
      } else {
        data = {
          ...data,
          driverId: driverId,
          companyId: userId,
          type: documentRequestTypes.company_request.value,
        };
      }

      const {success, doc: accessDocsRequest} = await GeneralServices.create({
        data: data,
        model: DocumentAccessModel,
      });

      if (success) {
        let notificationData = {};
        if (role === roles.driver.value) {
          notificationData = {
            userId: companyId,
            relatedUser: userId,
            type: notificationTypes.driver_document_access.value,
          };
        } else {
          notificationData = {
            userId: driverId,
            relatedUser: userId,
            type: notificationTypes.company_document_access.value,
          };
        }
        await GeneralServices.create({
          data: notificationData,
          model: NotificationsModel,
        });
        return {success: true, accessDocsRequest};
      } else {
        return {success: false};
      }
    } catch (error) {
      return {success: false, error};
    }
  }
};
