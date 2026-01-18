const {restrictedUserData} = require('../constants/usersConstants');
const {DocumentAccessModel, UsersModel} = require('../models');

module.exports = class DocumentsAccessServices {
  static async getDocumentAccessRequestsForCompany({
    page,
    limit,
    userId,
    status,
  }) {
    try {
      const skip = (page - 1) * limit;

      const query = {companyId: userId, status: status};

      const [totalCount, data] = await Promise.all([
        DocumentAccessModel.countDocuments(query),
        DocumentAccessModel.find(query, null, {skip, limit}).populate({
          path: 'driverId',
          select: restrictedUserData,
        }),
      ]);

      return {success: true, result: {totalCount, data}};
    } catch (error) {
      return {success: false, error};
    }
  }
  static async getDocumentAccessRequestsForDriver({
    page,
    limit,
    userId,
    status,
  }) {
    try {
      const skip = (page - 1) * limit;

      const query = {driverId: userId, status: status};

      const [totalCount, data] = await Promise.all([
        DocumentAccessModel.countDocuments(query),
        DocumentAccessModel.find(query, null, {skip, limit}).populate(
          'companyId'
        ),
      ]);

      return {success: true, result: {totalCount, data}};
    } catch (error) {
      return {success: false, error};
    }
  }

  static async getRequestedDocuments({userId, hasAccess}) {
    try {
      const documents = await UsersModel.findById({_id: userId}).select(
        hasAccess ? 'documents' : 'documents.label'
      );
      return {success: true, documents};
    } catch (error) {
      return {success: false, error};
    }
  }
};
