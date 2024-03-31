const config = require('config');
const {UsersServices} = require('../services');
const actions = require('../utils/actions');
const {
  UsersErrorsFactory,
  GeneralErrorsFactory,
  UsersResponsesFactory,
  UsersEntityFactory,
} = require('../factories');

const {jwtUtils} = require('../utils');
const {usersConstants} = require('../constants');

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

  static async loginUser(req, res, next) {
    const inputData = req.body;

    const userToLogin = await UsersServices.getUserByEmail({
      email: inputData.email,
    });

    if (!userToLogin) return next(UsersErrorsFactory.wrongEmailOrPasswordErr());

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

  static async deleteDocuments(req, res, next) {
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
};
