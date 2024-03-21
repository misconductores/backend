const {GeneralResponsesFactory, GeneralErrorsFactory} = require('../factories');
const {GeneralServices} = require('../services');

module.exports = class GeneralController {
  static create({model, key}) {
    return async (req, res, next) => {
      const data = req.body;
      const {doc, error} = await GeneralServices.create({
        data,
        model,
      });

      if (doc) {
        next(GeneralResponsesFactory.dataSavedSuccessfully({data: doc, key}));
      }
      if (error) throw error;
    };
  }

  static findAll({model, key}) {
    // Method for finding all documents without a login user
    return async (req, res, next) => {
      const {docs, error} = await GeneralServices.findAll({model});
      if (error) throw error;
      if (docs) {
        next(
          GeneralResponsesFactory.dataRetrievedSuccessfully({data: docs, key})
        );
      } else {
        next(GeneralErrorsFactory.notFoundErr());
      }
    };
  }
  static findAllByUserId({model, key}) {
    // Method for finding all documents with a login user
    return async (req, res, next) => {
      const {docs, error} = await GeneralServices.findAllByUserId({
        model,
        user: req.jwtToken.user.id,
      });
      if (error) throw error;
      if (docs) {
        next(
          GeneralResponsesFactory.dataRetrievedSuccessfully({data: docs, key})
        );
      } else {
        next(GeneralErrorsFactory.notFoundErr());
      }
    };
  }

  static update({model, key}) {
    return async (req, res, next) => {
      const {id} = req.params;
      const data = req.body;
      const {doc, error} = await GeneralServices.update({
        id,
        model,
        data,
      });
      if (error) throw error;
      if (!doc) {
        next(GeneralErrorsFactory.notFoundErr());
      } else {
        next(GeneralResponsesFactory.dataUpdatedSuccessfully({data: doc, key}));
      }
    };
  }

  static delete({model, key}) {
    return async (req, res, next) => {
      const {id} = req.params;
      const {doc, error} = await GeneralServices.delete({
        id,
        model,
      });
      if (error) throw error;

      if (!doc) {
        next(GeneralErrorsFactory.notFoundErr());
      } else {
        next(GeneralResponsesFactory.dataDeletedSuccessfully({data: doc, key}));
      }
    };
  }
};
