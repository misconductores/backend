const {OthersResponsesFactory} = require('../factories');
const OthersErrorFactory = require('../factories/errors/others');
const PostalCodeModel = require('../models/PostalCodeModel');
const {GeneralServices} = require('../services');

module.exports = class OthersController {
  static async getCitiesList(req, res, next) {
    let {success, data, err} = await GeneralServices.findAllDistinct({
      query: 'city',
      model: PostalCodeModel,
    });

    data = data.map((x) => ({
      label: x,
    }));

    if (!data || data.length === 0)
      return next(OthersErrorFactory.cityFoundErr());

    if (!success) throw err;

    return next(
      OthersResponsesFactory.cityListResponse({
        data,
      })
    );
  }
};
