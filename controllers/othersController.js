const {OthersResponsesFactory} = require('../factories');
const OthersErrorFactory = require('../factories/errors/others');
const PostalCodeModel = require('../models/PostalCodeModel');
const {GeneralServices, OthersServices} = require('../services');

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

  static async getCounters(req, res, next) {
    const role = req.jwtToken.user.role;
    const userId = req.jwtToken.user.id;

    const {success, counters, error} = await OthersServices.getCounters({
      role,
      userId,
    });

    if (success)
      return next(
        OthersResponsesFactory.countersRetrieveSuccessfully({counters})
      );

    if (error) throw error;
  }

  static async getCarrierInfo(req, res, next) {
    
    const { docketNumber } = req.params; 

      const {success, carrierInfo, error } = await OthersServices.getCarrierInfoByDocket(docketNumber);
      if (success)
        return next(
          OthersResponsesFactory.carrierInfoRetrieveSuccessfully({carrierInfo})
        );
  
      if (error) throw error;

  }

};
