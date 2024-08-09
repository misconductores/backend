const config = require('config');
const {
  UsersServices,
  FilesServices,
  GeneralServices,
  ReviewsServices,
} = require('../services');
const actions = require('../utils/actions');
const {
  UsersErrorsFactory,
  GeneralErrorsFactory,
  UsersResponsesFactory,
  UsersEntityFactory,
} = require('../factories');
const {jwtUtils} = require('../utils');
const {usersConstants} = require('../constants');
const UsersModel = require('../models/UsersModel');
const {
  driverStatuses,
  roles,
  statusTypes,
} = require('../constants/usersConstants');

module.exports = class UsersController {
  static async createUser(req, res, next) {
    let data = req.body;

    let isUserFound = await UsersServices.getUserByEmail({email: data.email});
    if (isUserFound) return next(UsersErrorsFactory.userAlreadyRegisteredErr());

    if (data.role === usersConstants.roles.driver.value) {
      data = {
        ...data,
        driverStatus: usersConstants.driverStatuses.available.value,
      };
    }

    const {success, err, user} = await UsersServices.createUser({data});

    if (success) {
      await actions.users.verifyUser({user});
      return next(UsersResponsesFactory.userRegisteredSuccessfully({user}));
    } else throw err;
  }

  static async getLoggedInUserInformation(req, res, next) {
    const {success, err, user} = await UsersServices.getUserById({
      id: req.jwtToken.user.id,
    });

    if (!user) return next(UsersErrorsFactory.userNotFoundErr());

    if (!success) throw err;

    return next(
      UsersResponsesFactory.singleUserInfoRetrievedRes({
        user,
      })
    );
  }

  static async getUserInformation(req, res, next) {
    const {id: userId} = req.params;

    const {success, error, user} = await UsersServices.getRestrictedUserById({
      userId,
    });

    if (!user) return next(UsersErrorsFactory.userNotFoundErr());

    if (success)
      return next(
        UsersResponsesFactory.singleUserInfoRetrievedRes({
          user,
        })
      );

    if (error) throw error;
  }

  static async loginUser(req, res, next) {
    const inputData = req.body;

    const userToLogin = await UsersServices.getUserByEmail({
      email: inputData.email,
    });

    if (!userToLogin) return next(UsersErrorsFactory.wrongEmailOrPasswordErr());

    if (userToLogin.driverStatus === driverStatuses.blocked.value)
      return next(UsersErrorsFactory.accountBlockedErr());

    const {success, err} = await UsersServices.verifyUserPassword({
      inputPassword: inputData.password,
      dbPassword: userToLogin.password,
    });

    if (!success) return next(UsersErrorsFactory.wrongEmailOrPasswordErr());

    if (!userToLogin.isVerified)
      return next(UsersErrorsFactory.userNotVerifiedErr());

    if (err) throw err;

    const user = UsersEntityFactory.cleanUserObj({
      user: userToLogin,
    });

    return next(
      UsersResponsesFactory.userLoggedInSuccessfully({
        user,
        isLoginRequest: true,
      })
    );
  }

  static async forgetPassword(req, res, next) {
    const user = await UsersServices.getUserByEmail({email: req.body.email});
    if (!user) return next(UsersErrorsFactory.userNotFoundErr());

    const resetToken = user.generateResetToken();
    await user.save();

    const domain = config.get('frontendURL');
    const url = `${domain}/auth/reset/${resetToken}`;

    await actions.users.resetPassword({user, resetUrl: url});

    next(
      UsersResponsesFactory.resetPasswordLinkGeneratedSuccessfully({
        resetToken,
        resetUrl: url,
      })
    );
  }

  static async resetPassword(req, res, next) {
    const newPassword = req.body.password;
    const token = req.params.token;

    const decodedToken = jwtUtils.verifyToken({token});
    if (!decodedToken) return next(UsersErrorsFactory.loginResetTokenErr());

    const resetArgs = {email: decodedToken.email, newPassword, token};
    const {user} = await UsersServices.resetPassword({resetArgs});

    if (!user) return next(UsersErrorsFactory.loginResetTokenUserErr());

    next(UsersResponsesFactory.passwordResetSuccessfully());
  }

  static async logout(req, res, next) {
    res.clearCookie(config.get('tokenVariable'));
    next(UsersResponsesFactory.logoutSuccessfully());
  }

  static async verifyUser(req, res, next) {
    const {token} = req.params;

    const decodedToken = jwtUtils.verifyToken({token});
    if (!decodedToken) return next(UsersErrorsFactory.loginResetTokenErr());

    const {user} = await UsersServices.getUserById({
      id: decodedToken.id,
    });

    if (user.isVerified)
      return next(UsersErrorsFactory.userAlreadyVerifiedErr());

    const {success, err} = await UsersServices.verifyUser({decodedToken});

    if (success) return next(UsersResponsesFactory.userVerifiedSuccessfully());
    else throw err;
  }

  static async regenerateVerifyToken(req, res, next) {
    const {email} = req.body;

    const user = await UsersServices.getUserByEmail({email});

    if (!user?.verificationToken)
      return next(GeneralErrorsFactory.badRequestErr());

    user.generateVerificationToken();
    await user.save();

    await actions.users.verifyUser({user});

    next(UsersResponsesFactory.resendVerificationEmail());
  }

  static async updateProfileImage(req, res, next) {
    const {success, err, user} = await UsersServices.getUserById({
      id: req.jwtToken.user.id,
    });

    if (!user) return next(UsersErrorsFactory.userNotFoundErr());

    if (!success) throw err;

    const {
      success: response,
      user: updatedUser,
      err: error,
    } = await UsersServices.updateProfileImage({user, file: req.file});

    if (response) {
      return next(
        UsersResponsesFactory.updateUserProfilePicRes({
          user: updatedUser,
        })
      );
    }
    if (error) {
      return next(UsersErrorsFactory.profileImgUpdateErr());
    }
  }

  static async uploadDocuments(req, res, next) {
    const {label} = req.body;
    const {success, err, user} = await UsersServices.getUserById({
      id: req.jwtToken.user.id,
    });
    if (!user) return next(UsersErrorsFactory.userNotFoundErr());
    if (!success) throw err;
    const {
      success: response,
      user: updatedUser,
      err: error,
    } = await UsersServices.updateDocuments({user, file: req.file, label});
    if (response) {
      return next(
        UsersResponsesFactory.updateDocumentRes({
          user: updatedUser,
        })
      );
    }
    if (!response) return next(UsersErrorsFactory.documentLabelErr());

    if (error) {
      return next(UsersErrorsFactory.documentUpdateErr());
    }
  }

  static async uploadPreRegisterDocuments(req, res, next) {
    const {label} = req.body;
    const file = req.file;
    const filesUrl = await FilesServices.uploadSingleFile({
      file,
      fileDir: 'pre-register-documents',
    });
    if (filesUrl.url) {
      const updatedData = {
        url: filesUrl.url,
        key: filesUrl.key,
        label: label,
      };
      const {success} = await UsersServices.createDocuments({
        data: updatedData,
      });
      if (success) {
        return next(
          UsersResponsesFactory.uploadPreRegisterDocumentRes({
            document: updatedData,
          })
        );
      } else {
        return next(UsersErrorsFactory.documentUploadErr());
      }
    }
    if (!filesUrl.url) return next(UsersErrorsFactory.documentUploadErr());
  }

  static async deleteDocuments(req, res, next) {
    const {label} = req.params;
    const {success, err, user} = await UsersServices.getUserById({
      id: req.jwtToken.user.id,
    });
    if (!user) return next(UsersErrorsFactory.userNotFoundErr());
    if (!success) throw err;
    const {
      success: response,
      user: updatedUser,
      err: error,
    } = await UsersServices.deleteDocument({user, label});

    if (!response) return next(UsersErrorsFactory.documentDeleteErr());
    if (response) {
      return next(
        UsersResponsesFactory.deleteDocumentRes({
          user: updatedUser,
        })
      );
    }
    if (error) {
      return next(UsersErrorsFactory.documentDeleteErr());
    }
  }

  static async deletePreRegisterDocuments(req, res, next) {
    const {key} = req.params;
    await FilesServices.deleteSingleFile({file: key});
    const {success} = await UsersServices.deletePreRegisterDocument({key: key});
    if (success) {
      return next(
        UsersResponsesFactory.deleteDocumentRes({
          user: {},
        })
      );
    } else {
      return next(UsersErrorsFactory.documentDeleteErr());
    }
  }

  static async updateProfile(req, res, next) {
    const data = req.body;
    const {success, err, user} = await UsersServices.getUserById({
      id: req.jwtToken.user.id,
    });
    if (!user) return next(UsersErrorsFactory.userNotFoundErr());
    if (!success) throw err;
    const {
      success: response,
      user: updatedUser,
      err: error,
    } = await UsersServices.updateProfile({user, data});

    if (!response) return next(UsersErrorsFactory.profileUpdateErr());
    if (response) {
      return next(
        UsersResponsesFactory.profileUpdateRes({
          user: updatedUser,
        })
      );
    }
    if (error) {
      return next(UsersErrorsFactory.profileUpdateErr());
    }
  }

  static async getPostalCodes(req, res, next) {
    const {postalCode} = req.params;
    const {success, data, err} = await UsersServices.getPostalCodes({
      postalCode,
    });

    if (!data) return next(UsersErrorsFactory.postalCodesFoundErr());

    if (!success) throw err;

    return next(
      UsersResponsesFactory.postalCodeInfoRes({
        data,
      })
    );
  }
  static async getDriversList(req, res, next) {
    const {success, err, user} = await UsersServices.getUserById({
      id: req.jwtToken.user.id,
    });
    if (!user) return next(UsersErrorsFactory.userNotFoundErr());
    if (!success) throw err;
    let {
      page,
      limit,
      title,
      location,
      handleEquipment,
      experience,
      federalLicenseTypes,
      stateLicenseTypes,
      vehicleType,
    } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const formattedHandleEquipment = handleEquipment?.split(',') || [];
    const formattedFederalLicenseTypes = federalLicenseTypes?.split(',') || [];
    const formattedStateLicenseTypes = stateLicenseTypes?.split(',') || [];
    const formattedExperience = experience?.split(',') || [];

    const {
      success: response,
      result,
      err: error,
    } = await UsersServices.getDriversList({
      page,
      limit,
      title,
      location,
      federalLicenseTypes: formattedFederalLicenseTypes,
      stateLicenseTypes: formattedStateLicenseTypes,
      equipment: formattedHandleEquipment,
      experience: formattedExperience,
      vehicleType,
    });
    if (response)
      return next(
        UsersResponsesFactory.driversRetrievedSuccessfully({
          count: result.totalCount,
          data: result.data,
          page: page,
          perPage: limit,
        })
      );
    if (!result || result.data.length === 0)
      return next(UsersErrorsFactory.driverNotFoundErr());
    if (error) throw error;
  }
  static async getCompaniesList(req, res, next) {
    const {success, err, user} = await UsersServices.getUserById({
      id: req.jwtToken.user.id,
    });
    if (!user) return next(UsersErrorsFactory.userNotFoundErr());
    if (!success) throw err;
    let {page, limit, title, location} = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const {
      success: response,
      result,
      err: error,
    } = await UsersServices.getCompaniesList({
      page,
      limit,
      title,
      location,
    });
    if (response)
      return next(
        UsersResponsesFactory.companyRetrievedSuccessfully({
          count: result.totalCount,
          data: result.data,
          page: page,
          perPage: limit,
        })
      );
    if (!result || result.data.length === 0)
      return next(UsersErrorsFactory.companyNotFoundErr());
    if (error) throw error;
  }
  static async checkRegisteredEmail(req, res, next) {
    let {email} = req.body;
    email = email.toLowerCase();
    const {doc} = await GeneralServices.findOne({
      query: {email: email},
      model: UsersModel,
    });
    if (doc) return next(UsersErrorsFactory.emailAlreadyExistErr());
    if (!doc) return next(UsersResponsesFactory.emailAvailable());
  }
  static async reviewAndBlockDriver(req, res, next) {
    const {userId} = req.params;
    const {reviewId} = req.body;

    const {doc: user} = await GeneralServices.findOne({
      query: {_id: userId},
      model: UsersModel,
    });

    if (user.driverStatus === driverStatuses.blocked.value)
      return next(UsersErrorsFactory.alreadyBlockedErr());

    if (user.role !== roles.driver.value)
      return next(UsersErrorsFactory.roleOtherThanDriverBlockErr());

    const {success, error} = await UsersServices.reviewAndBlockDriver({
      userId,
      reviewId,
    });

    if (success) return next(UsersResponsesFactory.userBlockedSuccessfully());

    if (error) throw error;
  }
  static async blockDriver(req, res, next) {
    const {userId} = req.params;

    const {doc: user} = await GeneralServices.findOne({
      query: {_id: userId},
      model: UsersModel,
    });

    if (user?.driverStatus === driverStatuses.blocked.value)
      return next(UsersErrorsFactory.alreadyBlockedErr());

    if (user?.role !== roles.driver.value)
      return next(UsersErrorsFactory.roleOtherThanDriverBlockErr());

    const {success, error} = await GeneralServices.update({
      id: userId,
      data: {driverStatus: driverStatuses.blocked.value},
      model: UsersModel,
    });

    if (success) return next(UsersResponsesFactory.userBlockedSuccessfully());

    if (error) throw error;
  }
  static async getBlockedDrivers(req, res, next) {
    let {limit, page, title} = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const {success, error, result} = await UsersServices.getBlockedDrivers({
      page,
      limit,
      title,
    });

    if (success)
      return next(
        UsersResponsesFactory.driversRetrievedSuccessfully({
          count: result.totalCount,
          data: result.data,
          page: page,
          perPage: limit,
        })
      );

    if (error) throw error;
  }
  static async unBlockDriver(req, res, next) {
    const {userId} = req.params;

    const {doc: user} = await GeneralServices.findOne({
      query: {_id: userId},
      model: UsersModel,
    });

    if (user.driverStatus !== driverStatuses.blocked.value)
      return next(UsersErrorsFactory.alreadyUnBlockedErr());

    const {success, error} = await GeneralServices.update({
      id: userId,
      data: {driverStatus: driverStatuses.available.value},
      model: UsersModel,
    });

    if (success) return next(UsersResponsesFactory.userUnBlockedSuccessfully());

    if (error) throw error;
  }
};
