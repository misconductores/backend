const omit = require('lodash/omit');

module.exports = class UsersEntityFactory {
  constructor() {}

  static cleanUserObj({user, extraFieldsToOmit = []}) {
    const fieldsToOmit = [
      '_id',
      '__v',
      'password',
      'createdAt',
      'updatedAt',
      ...extraFieldsToOmit,
    ];

    return omit({
      id: user._id,
      ...omit(user.toJSON(), fieldsToOmit),
    });
  }
};
