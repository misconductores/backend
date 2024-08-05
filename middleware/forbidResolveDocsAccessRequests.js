const {statusTypes} = require('../constants/usersConstants');
const {DocumentsAccessErrors} = require('../factories');
const {DocumentAccessModel} = require('../models');
const {GeneralServices} = require('../services');

module.exports = async (req, res, next) => {
  try {
    const {id} = req.params;
    const {status} = req.body;

    const {doc: docAccessRequest} = await GeneralServices.findOne({
      query: {
        _id: id,
        status: status,
      },
      model: DocumentAccessModel,
    });

    if (docAccessRequest)
      return next(DocumentsAccessErrors.requestResolvedErr());

    next();
  } catch (error) {
    return next(GeneralErrorsFactory.internalErr({error}));
  }
};
