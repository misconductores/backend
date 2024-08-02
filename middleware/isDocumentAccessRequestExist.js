const {statusTypes} = require('../constants/usersConstants');
const {GeneralErrorsFactory, DocumentsAccessErrors} = require('../factories');
const {DocumentAccessModel} = require('../models');
const {GeneralServices} = require('../services');

module.exports = async (req, res, next) => {
  try {
    const userId = req.jwtToken.user.id;
    const {requestedUserId} = req.body;

    const {doc: accessedRequest} = await GeneralServices.findOne({
      query: {
        companyId: userId,
        driverId: requestedUserId,
        status: {$in: [statusTypes.accepted.value, statusTypes.pending.value]},
      },
      model: DocumentAccessModel,
    });

    if (accessedRequest)
      return next(DocumentsAccessErrors.documentsRequestAlreadySendErr());

    next();
  } catch (error) {
    return next(GeneralErrorsFactory.internalErr({error}));
  }
};
