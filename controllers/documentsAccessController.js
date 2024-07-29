const {statusTypes} = require('../constants/usersConstants');
const {DocumentsAccessErrors} = require('../factories');
const DocumentsAccessErrorsFactory = require('../factories/errors/documentsAccess');
const DocumentsAccessResponsesFactory = require('../factories/responses/documentsAccess');
const DocumentAccessModel = require('../models/DocumentAccessModel');
const {DocumentsAccessServices} = require('../services');
const GeneralServices = require('../services/generalServices');
const {getRemainingDays} = require('../utils/DateCalculations');
const {findDocumentsAccess} = require('../utils/helpers/documentsAccess');

module.exports = class DocumentsAccessController {
  static async accessRequestForDocuments(req, res, next) {
    const userId = req.jwtToken.user.id;
    const role = req.jwtToken.user.role;

    const {driverId, companyId} = req.body;

    let findAccessDocumentQuery = findDocumentsAccess({
      role,
      driverId,
      companyId,
      userId,
    });

    const {doc: documentsAccessRequest} = await GeneralServices.findOne({
      query: findAccessDocumentQuery,
      model: DocumentAccessModel,
    });

    if (
      documentsAccessRequest &&
      (documentsAccessRequest.status === statusTypes.pending.value ||
        documentsAccessRequest.status === statusTypes.accepted.value)
    )
      return next(
        DocumentsAccessErrorsFactory.documentsRequestAlreadySendErr()
      );

    if (
      documentsAccessRequest &&
      documentsAccessRequest.status === statusTypes.rejected.value
    ) {
      const remainingDays = getRemainingDays({
        createdAt: documentsAccessRequest.createdAt,
      });
      return next(
        DocumentsAccessErrors.docsAccessRequestAfterDaysErr({
          day: remainingDays,
        })
      );
    }

    const {success, accessDocsRequest, error} =
      await DocumentsAccessServices.accessRequestForDocuments({
        role,
        driverId,
        companyId,
        userId,
      });

    if (success)
      return next(
        DocumentsAccessResponsesFactory.documentsRequestSentSuccessfully({
          accessDocsRequest,
        })
      );

    if (error) throw error;
  }
};
