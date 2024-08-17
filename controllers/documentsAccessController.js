const {notificationTypes, statusTypes} = require('../constants/usersConstants');
const {DocumentsAccessResponsesFactory} = require('../factories');
const {DocumentAccessModel, NotificationsModel} = require('../models');
const {GeneralServices, DocumentsAccessServices} = require('../services');
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
      },
      model: DocumentAccessModel,
    });

    if (success) {
      await GeneralServices.create({
        data: {
          userId: requestedUserId,
          relatedUserId: userId,
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
  static async getDocumentAccessRequestsForCompany(req, res, next) {
    const userId = req.jwtToken.user.id;

    let {page, limit, status} = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const {success, error, result} =
      await DocumentsAccessServices.getDocumentAccessRequestsForCompany({
        page,
        limit,
        userId,
        status,
      });

    if (success)
      return next(
        DocumentsAccessResponsesFactory.documentRequestsRetrievedSuccessfully({
          count: result.totalCount,
          data: result.data,
          page,
          perPage: limit,
        })
      );

    if (error) throw error;
  }
  static async getDocumentAccessRequestsForDriver(req, res, next) {
    const userId = req.jwtToken.user.id;

    let {page, limit, status} = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const {success, error, result} =
      await DocumentsAccessServices.getDocumentAccessRequestsForDriver({
        page,
        limit,
        userId,
        status,
      });

    if (success)
      return next(
        DocumentsAccessResponsesFactory.documentRequestsRetrievedSuccessfully({
          count: result.totalCount,
          data: result.data,
          page,
          perPage: limit,
        })
      );

    if (error) throw error;
  }

  static async getRequestedDocuments(req, res, next) {
    const {userId} = req.params;
    const {hasAccess} = req;

    const {success, result, error} =
      await DocumentsAccessServices.getRequestedDocuments({userId, hasAccess});

    if (success)
      return next(
        DocumentsAccessResponsesFactory.documentsRetrievedSuccessfully({
          documents: result.documents,
          hasAccess: result.hasAccess,
        })
      );

    if (error) throw error;
  }

  static async updateDocumentsRequestStatus(req, res, next) {
    const userId = req.jwtToken.user.id;
    const {id} = req.params;
    const {status} = req.body;

    let data = {
      status: status,
    };

    if (status === statusTypes.accepted.value) {
      data = {
        ...data,
        startDate: getCurrentDate(),
        endDate: dateAfterSevenDays(),
      };
    }

    const {
      success,
      error,
      doc: updatedDocsAccessRequest,
    } = await GeneralServices.update({
      id,
      data,
      model: DocumentAccessModel,
    });

    if (success) {
      await GeneralServices.create({
        data: {
          userId: updatedDocsAccessRequest.companyId,
          relatedUserId: userId,
          type:
            updatedDocsAccessRequest.status === statusTypes.accepted.value
              ? notificationTypes.driver_accepted_docs_access.value
              : notificationTypes.driver_rejected_docs_access.value,
        },
        model: NotificationsModel,
      });
      return next(
        DocumentsAccessResponsesFactory.documentsAccessReqStatusUpdatedSuccessfully()
      );
    }

    if (error) throw error;
  }

  static async removeDocumentAccess(req, res, next) {
    const userId = req.jwtToken.user.id;
    const {id} = req.params;

    const {
      success,
      error,
      doc: updatedDocsAccessRequest,
    } = await GeneralServices.update({
      id,
      data: {status: statusTypes.expired.value, endDate: getCurrentDate()},
      model: DocumentAccessModel,
    });

    if (success) {
      await GeneralServices.create({
        data: {
          userId: updatedDocsAccessRequest.companyId,
          relatedUserId: userId,
          type: notificationTypes.driver_removed_docs_access.value,
        },
        model: NotificationsModel,
      });
      return next(
        DocumentsAccessResponsesFactory.documentsAccessReqStatusUpdatedSuccessfully()
      );
    }

    if (error) throw error;
  }
};
