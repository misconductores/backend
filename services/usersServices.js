const {MongosFactory} = require('../factories');
const UsersModel = require('../models/UsersModel');
const {passwordsUtils} = require('../utils');
const FilesServices = require('./fileServices');

module.exports = class UsersServices {
  static async getUserByEmail({email}) {
    email = email.toLowerCase();
    return UsersModel.findOne({email}); // can't use mongooseFactory here because this services is used to login user. If we use the factory here, then this won't return the password which will cause an error
  }

  static async getUserById({id}) {
    try {
      const query = {_id: id};
      const {doc: user, success} = await MongosFactory.findOne(
        UsersModel,
        query
      );
      return {success, user};
    } catch (err) {
      return {success: false, err};
    }
  }

  static async createUser({data}) {
    try {
      data.email = data.email.toLowerCase();
      // remove password encryption from here because we have to define password encryption in user model pre save middleware

      const user = await UsersModel.create(data); // can't use mongooseFactory here because we need the user to generate the verification token for them.

      user.generateVerificationToken();
      await user.save();

      return {success: true, user};
    } catch (err) {
      return {success: false, err};
    }
  }

  static async verifyUserPassword({inputPassword, dbPassword}) {
    try {
      const isCorrectPassword = await passwordsUtils.verify({
        inputPassword,
        dbPassword,
      });
      return {
        success: isCorrectPassword,
      };
    } catch (err) {
      return {
        success: false,
        err,
      };
    }
  }

  static async resetPassword({resetArgs: {email, newPassword, token}}) {
    try {
      const password = await passwordsUtils.saltHashPassword({
        password: newPassword,
      });
      const query = {email, loginResetToken: token};
      const update = {password, $unset: {loginResetToken: 1}};

      const res = await MongosFactory.updateOne(UsersModel, query, update);

      return {success: res.success, user: res.doc};
    } catch (err) {
      return {success: false, err};
    }
  }

  static async setPermissions({userId, permissions}, session) {
    try {
      const query = {_id: userId};
      const update = {};

      const addPermission = ({entityType, entityId, accessLevelsToSet}) => {
        update[`${entityType}.${entityId}`] = accessLevelsToSet;
      };

      if (Array.isArray(permissions)) permissions.forEach(addPermission);
      else addPermission(permissions);

      const res = await MongosFactory.updateOne(
        UsersModel,
        query,
        update,
        session
      );
      const {doc: user, success} = res;

      return {success, user};
    } catch (err) {
      return {success: false, err};
    }
  }

  static async removePermissions({mapKey}) {
    try {
      const query = {[mapKey]: {$exists: true}};
      const update = {$unset: {[mapKey]: 1}};

      const res = await MongosFactory.updateMany(UsersModel, query, update);

      return {success: res.success};
    } catch (err) {
      return {success: false, err};
    }
  }

  static async verifyUser({decodedToken}) {
    try {
      const query = {_id: decodedToken.id};
      const update = {isVerified: true, $unset: {verificationToken: 1}};

      const {success} = await MongosFactory.updateOne(
        UsersModel,
        query,
        update
      );

      return {success};
    } catch (err) {
      return {success: false, err};
    }
  }

  static async updateProfileImage({user, file}) {
    try {
      const filesUrl = await FilesServices.uploadSingleFile({
        file,
        fileDir: 'profile-images',
      });

      let modifiedKey = filesUrl.key.replace(/^profile-images\//, '');

      const updatedData = {
        url: filesUrl.url,
        key: modifiedKey,
      };
      const query = user.id;
      const update = {
        profilePic: updatedData,
      };
      const {success, doc: updatedUser} = await MongosFactory.UpdateById(
        UsersModel,
        query,
        update
      );
      return {success, user: updatedUser};
    } catch (err) {
      return {success: false, err};
    }
  }
};
