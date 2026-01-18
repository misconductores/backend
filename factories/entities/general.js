const omit = require('lodash/omit');

module.exports = class GeneralEntityFactory {
  static cleanMongooseData({data, extraFieldsToOmit = []}) {
    const fieldsToOmit = [
      '_id',
      '__v',
      'password',
      'updatedAt',
      'createdAt',
      ...extraFieldsToOmit,
    ];

    const cleanObject = (obj) => ({
      id: obj?._id,
      ...omit(obj?.toJSON(), fieldsToOmit),
    });

    return Array.isArray(data)
      ? data.map((item) => cleanObject(item))
      : cleanObject(data);
  }
};
