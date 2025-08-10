const config = require('config');
const { MongosFactory } = require('../factories');
const UsersModel = require('../models/UsersModel');
const { passwordsUtils } = require('../utils');
const FilesServices = require('./fileServices');
const DocumentsModel = require('../models/DocumentsModel');
const PostalCodeModel = require('../models/PostalCodeModel');
const JobModel = require('../models/JobModel');
const sendEmail = require('../utils/email/send');
const {
  roles,
  restrictedUserData,
  connectionStatuses,
  driverStatuses,
  statusTypes,
  freeSubscriptionSelectedData,
  subscriptionModes,
} = require('../constants/usersConstants');
const {
    defaultEmailAddress,
} = require('../values/contants/email');
const {
  addDriverConditions,
  calculateRestrictedData,
} = require('../utils/helpers/users');
const {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const accessKeyId = config.get('awsAccessKey');
const secretAccessKey = config.get('awsSecretAccessKey');
const Bucket = config.get('awsBucket');
const region = config.get('awsBucketRegion');
const mongoose = require('mongoose');
const {
  ReviewsModel,
  ConnectionsModel,
  SubscriptionsModel,
} = require('../models');
const GeneralServices = require('./generalServices');
const { calculateAge } = require('../utils/DateCalculations');
const ServiceModel = require('../models/ServiceModel');
const PreRegisteredDriver = require('../models/PreRegisteredDriverModel'); // Asegúrate de tener este modelo
const UsersErrorsFactory = require('../factories/errors/users');
const { preRegistrationStatus } = require('../constants/generalConstant');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const s3Client = new S3Client({
  region: region,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});

module.exports = class UsersServices {
  static async getUserByEmail({ email }) {
    email = email.toLowerCase();
    return UsersModel.findOne({ email }); // can't use mongooseFactory here because this services is used to login user. If we use the factory here, then this won't return the password which will cause an error
  }

  static async getUserById({ id }) {
    try {
      const query = { _id: id };
      const { doc: user, success } = await MongosFactory.findOne(
        UsersModel,
        query
      );
      return { success, user };
    } catch (err) {
      return { success: false, err };
    }
  }

  static async createUser({ data }) {
    try {
      data.email = data.email.toLowerCase();
      // remove password encryption from here because we have to define password encryption in user model pre save middleware

      const user = await UsersModel.create(data); // can't use mongooseFactory here because we need the user to generate the verification token for them.

      user.generateVerificationToken();
      await user.save();

      if (data.documents) {
        const keysToDelete = data.documents.map((document) => document.key);
        await DocumentsModel.deleteMany({ key: { $in: keysToDelete } });

        for (const document of data.documents) {
          const { url, key } = document;
          const sourceParams = { Bucket, Key: key };
          const modifiedKey = key.replace(/^pre-register-documents\//, '');
          const destinationKey = `documents/${user.id}/${modifiedKey}`;

          const copyObjectCommand = new CopyObjectCommand({
            Bucket,
            CopySource: `${Bucket}/${sourceParams.Key}`,
            Key: destinationKey,
          });
          await s3Client.send(copyObjectCommand);

          const newKey = key.replace(
            'pre-register-documents',
            `documents/${user.id}`
          );
          const newUrl = url.replace(
            'pre-register-documents',
            `documents/${user.id}`
          );

          const deleteObjectCommand = new DeleteObjectCommand(sourceParams);
          await s3Client.send(deleteObjectCommand);

          await UsersModel.updateOne(
            { _id: user.id, 'documents.key': key },
            {
              $set: {
                'documents.$.url': newUrl,
                'documents.$.key': newKey,
              },
            }
          );
        }
      }

      return { success: true, user };
    } catch (err) {
      return { success: false, err };
    }
  }

  static async verifyUserPassword({ inputPassword, dbPassword }) {
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

  static async resetPassword({ resetArgs: { email, newPassword, token } }) {
    try {
      const password = await passwordsUtils.saltHashPassword({
        password: newPassword,
      });
      const query = { email, loginResetToken: token };
      const update = { password, $unset: { loginResetToken: 1 } };

      const res = await MongosFactory.updateOne(UsersModel, query, update);

      return { success: res.success, user: res.doc };
    } catch (err) {
      return { success: false, err };
    }
  }

  static async setPermissions({ userId, permissions }, session) {
    try {
      const query = { _id: userId };
      const update = {};

      const addPermission = ({ entityType, entityId, accessLevelsToSet }) => {
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
      const { doc: user, success } = res;

      return { success, user };
    } catch (err) {
      return { success: false, err };
    }
  }

  static async removePermissions({ mapKey }) {
    try {
      const query = { [mapKey]: { $exists: true } };
      const update = { $unset: { [mapKey]: 1 } };

      const res = await MongosFactory.updateMany(UsersModel, query, update);

      return { success: res.success };
    } catch (err) {
      return { success: false, err };
    }
  }

  static async verifyUser({ decodedToken }) {
    try {
      const query = { _id: decodedToken.id };
      const update = { isVerified: true, $unset: { verificationToken: 1 } };

      const { success } = await MongosFactory.updateOne(
        UsersModel,
        query,
        update
      );

      return { success };
    } catch (err) {
      return { success: false, err };
    }
  }

  static async updateProfileImage({ user, file }) {
    try {
      if (user.profilePic.key) {
        await FilesServices.deleteSingleFile({ file: user.profilePic.key });
      }
      const filesUrl = await FilesServices.uploadSingleFile({
        file,
        fileDir: `profile-images/${user.id}`,
      });

      let modifiedKey = filesUrl.key.replace(`^profile-images/${user.id}/`, '');

      const updatedData = {
        url: filesUrl.url,
        key: modifiedKey,
      };
      const query = user.id;
      const update = {
        profilePic: updatedData,
      };
      const { success, doc: updatedUser } = await MongosFactory.UpdateById(
        UsersModel,
        query,
        update
      );
      return { success, user: updatedUser };
    } catch (err) {
      return { success: false, err };
    }
  }

  static async updateDocuments({ user, file, label }) {
    try {
      const findDocument = user.documents.find((x) => x.label === label);

      if (findDocument) {
        return { success: false };
      }
      const filesUrl = await FilesServices.uploadSingleFile({
        file,
        fileDir: `documents/${user.id}`,
      });

      const updatedData = {
        url: filesUrl.url,
        key: filesUrl.key,
        label: label,
      };
      const query = user.id;
      const update = updatedData;
      const { success, doc: updatedUser } =
        await MongosFactory.UpdateDocumentsById(UsersModel, query, update);
      return { success, user: updatedUser };
    } catch (err) {
      return { success: false, err };
    }
  }

  static async deleteDocument({ user, label }) {
    try {
      const findDocument = user.documents.find((x) => x.label === label);
      if (findDocument) {
        const query = user.id;
        const update = label;
        await FilesServices.deleteSingleFile({ file: findDocument.key });
        const { success, doc: updatedUser } =
          await MongosFactory.deleteDocumentsById(UsersModel, query, update);
        return { success, user: updatedUser };
      } else {
        return { success: false };
      }
    } catch (err) {
      return { success: false, err };
    }
  }

  static async updateProfile({ user, data }) {
    try {
      const query = user.id;
      const update = data;
      const { success, doc: updateUser } = await MongosFactory.UpdateById(
        UsersModel,
        query,
        update
      );
      return { success, user: updateUser };
    } catch (err) {
      return { success: false, err };
    }
  }

  static async createDocuments({ data }) {
    try {
      const document = new DocumentsModel(data);
      await document.save();
      return { success: true, document };
    } catch (err) {
      return { success: false, err };
    }
  }

  static async deletePreRegisterDocument({ key }) {
    try {
      await DocumentsModel.findOneAndDelete({ key: key });
      return { success: true };
    } catch (err) {
      return { success: false, err };
    }
  }

  static async deleteAllDocuments() {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const documents = await DocumentsModel.find({
        createdAt: { $lt: twentyFourHoursAgo },
      });

      if (documents.length > 0) {
        for (const document of documents) {
          await FilesServices.deleteSingleFile({ file: document.key });
        }
        await DocumentsModel.deleteMany({ createdAt: { $lt: twentyFourHoursAgo } });
        return { success: true };
      } else {
        return {
          success: false,
        };
      }
    } catch (err) {
      return { success: false, err };
    }
  }
  static async getPostalCodes({ postalCode }) {
    const newPostalCode = Number(postalCode);
    try {
      const data = await PostalCodeModel.find({
        postalCode: newPostalCode,
      });
      return { success: true, data };
    } catch (err) {
      return { success: false, err };
    }
  }
  static async getDriversList({
    page,
    limit,
    title,
    location,
    equipment,
    experience,
    federalLicenseTypes,
    stateLicenseTypes,
    vehicleType,
    userId,
  }) {
    const query = {
      role: roles.driver.value,
    };

    const andConditions = addDriverConditions({
      query,
      title,
      location,
      equipment,
      experience,
      federalLicenseTypes,
      stateLicenseTypes,
      vehicleType,
    });

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const { doc: subscription } = await GeneralServices.findOne({
      query: { userId },
      model: SubscriptionsModel,
    });

    const isFreeSubscriber =
      subscription?.subscriptionMode === subscriptionModes.free.value;

    try {
      const skip = (page - 1) * limit;
      const [totalCount, data] = await Promise.all([
        UsersModel.find(query).countDocuments(),
        UsersModel.find(query, null, {
          skip,
          limit,
        }).select(
          isFreeSubscriber ? freeSubscriptionSelectedData : restrictedUserData
        ),
      ]);
      return { success: true, result: { totalCount, data } };
    } catch (err) {
      return { success: false, err };
    }
  }

  static async getCompaniesList({ page, limit, title, location }) {
    try {
      const query = {
        role: roles.company.value,
      };

      if (title) {
        title = title.trim();
        const titleWords = title.split(' ').filter((word) => word.length > 0);
        query.$and = titleWords.map((word) => ({
          companyName: { $regex: word, $options: 'i' },
        }));
      }

      if (location) {
        query.city = location;
      }

      let finalList = [];
      const totalCount = await UsersModel.find(query).countDocuments();
      const skip = (page - 1) * limit;
      const data = await UsersModel.find(query, null, {
        skip,
        limit,
      });
      for (const user of data) {
        const jobs = await JobModel.find({ companyId: user._id });
        let finalObject = { company: user, jobs };
        finalList.push(finalObject);
      }
      return { success: true, result: { totalCount, data: finalList } };
    } catch (err) {
      return { success: false, err };
    }
  }
  static async rejectAndBlockDriver({ userId, reviewId }) {
    const session = await mongoose.startSession();

    try {
      const { doc: connection } = await GeneralServices.findOne({
        query: { driverId: userId, status: connectionStatuses.active.value },
        model: ConnectionsModel,
      });

      session.startTransaction();

      await UsersModel.findByIdAndUpdate(
        { _id: userId },
        { driverStatus: driverStatuses.underInspection.value },
        { session }
      );

      await ReviewsModel.findByIdAndUpdate(
        { _id: reviewId },
        { status: statusTypes.rejected.value },
        { session }
      );

      if (connection) {
        await ConnectionsModel.updateOne(
          { driverId: userId, status: connectionStatuses.active.value },
          { status: connectionStatuses.inactive.value },
          { session }
        );
      }

      await session.commitTransaction();
      session.endSession();

      return { success: true };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      return { success: false, error };
    }
  }

  static async getBlockedDrivers({ page, limit, title }) {
    try {
      const skip = (page - 1) * limit;

      let query = {};

      const andConditions = [
        { driverStatus: driverStatuses.underInspection.value },
      ];

      if (title) {
        title = title.trim();
        const titleWords = title.split(' ').filter((word) => word.length > 0);
        const titleConditions = titleWords.map((word) => ({
          $or: [
            { firstName: { $regex: word, $options: 'i' } },
            { lastName: { $regex: word, $options: 'i' } },
          ],
        }));
        andConditions.push(...titleConditions);
      }

      if (andConditions.length > 0) {
        query.$and = andConditions;
      }

      const [totalCount, data] = await Promise.all([
        UsersModel.countDocuments(query),
        UsersModel.find(query, null, { skip, limit }).select(restrictedUserData),
      ]);

      return { success: true, result: { totalCount, data } };
    } catch (error) {
      return { success: false, error };
    }
  }
  static async getRestrictedUserById({
    userId,
    isFreeSubscription = false,
    isCompanyDriver = false,
  }) {
    try {
      const user = await UsersModel.findById({ _id: userId })
        .select(
          isFreeSubscription
            ? freeSubscriptionSelectedData
            : calculateRestrictedData({ isCompanyDriver })
        )
        .lean();

      const age = calculateAge({ dateOfBirth: user?.dateOfBirth });

      let finalUser = {
        ...user,
        age: parseInt(age),
        id: user?._id,
      };

      if (isFreeSubscription) delete finalUser.dateOfBirth;

      return { success: true, user: finalUser };
    } catch (error) {
      return { success: false, error };
    }
  }

  static async getServicesList() {
    try {
      const services = await ServiceModel.find();
      return { success: true, services };
    } catch (err) {
      return { success: false, err };
    }
  }

  static async preRegisterDriver({ data }) {
    const email = data.email.toLowerCase();

    const existingUser = await UsersModel.findOne({ email });
    if (existingUser) {
      return { success: false, error: UsersErrorsFactory.userAlreadyRegisteredErr() };
    }

    const preRegisterData = {
      ...data,
      role: roles.driver.value,
      status: preRegistrationStatus.PENDING
    };

    try {
      const preRegisteredDriver = new PreRegisteredDriver(preRegisterData);
      await preRegisteredDriver.save();

      const to = preRegisteredDriver.email;
      const from = defaultEmailAddress;
      const templateId = 'd-a1a3caf5d11f4614bd4719615a6210de';

      const driverFullName = `${data.firstName} ${data.lastName}`;
      const token = preRegisteredDriver.preRegistrationToken;
      const domain = config.get('frontendURL');
      const url = `${domain}/auth/preregistration/password/${token}`;
      const company = await UsersModel.findById(preRegisteredDriver.createdBy);
      const dynamicTemplateData = {
        name: driverFullName,
        companyName: company?.companyName,
        email: email,
        verifyUrl: url,
      };
      sendEmail({ to, from, templateId, dynamic_template_data: dynamicTemplateData });

      return { success: true, user: preRegisteredDriver };
    } catch (err) {
      return { success: false, error: UsersErrorsFactory.preRegisterDriverErr() };
    }
  }



  static async preRegisterPassword({ token, password }) {
    
    const preregister = await PreRegisteredDriver.findOne({ preRegistrationToken: token });

    if (!preregister || preregister.tokenExpiresAt < new Date() || preregister.status == preRegistrationStatus.PASSWORD_SET) {
      return { success: false, error: UsersErrorsFactory.invalidTokenErr() };
    }

    //const hashedPassword = await passwordsUtils.saltHashPassword({ password });

    preregister.password = password;
    preregister.status = preRegistrationStatus.PASSWORD_SET;

    await preregister.save();

    return { success: true };
  }

  static async getPreRegisteredDriverDetails({ token }) {
    try {
      const preRegisterDriver = await PreRegisteredDriver.findOne({
        preRegistrationToken: token,
      });

      if (!preRegisterDriver) {
        return { success: false, error: UsersErrorsFactory.preRegisterDriverNotFoundErr() };
      }

      return { success: true, preRegisterDriver };
    } catch (err) {
      return { success: false, error: UsersErrorsFactory.preRegisterDriverRetrievalErr() };
    }
  }

};
