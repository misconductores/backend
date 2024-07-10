const {OffersModel} = require('../models');
const GeneralServices = require('./generalServices');

module.exports = class OffersServices {
  static async updateOfferStatus({id, status}) {
    try {
      const {doc: updatedOffer} = await GeneralServices.update({
        id,
        model: OffersModel,
        data: {status: status},
      });
      return {success: true, updatedOffer};
    } catch (err) {
      return {success: false, err};
    }
  }

  static async findOfferById({id}) {
    try {
      const {doc: offer} = await GeneralServices.findById({
        id,
        model: OffersModel,
      });
      return {success: true, offer};
    } catch (err) {
      return {success: false, err};
    }
  }
};
