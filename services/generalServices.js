const {MongosFactory} = require('../factories');

module.exports = class GeneralServices {
  static async create({data, model}) {
    try {
      const {doc, success} = await MongosFactory.create(model, data);
      return {success, doc};
    } catch (error) {
      return {success: false, error};
    }
  }

  static async findAll({model}) {
    // Method for finding all documents without a login user
    try {
      let query = {};
      const {docs, success} = await MongosFactory.find(model, query);
      return {success, docs};
    } catch (error) {
      return {success: false, error};
    }
  }
  static async findAllByUserId({user, model}) {
    // Method for finding all documents associated with a login user
    try {
      let query = {user};
      const {docs, success} = await MongosFactory.find(model, query);
      return {success, docs};
    } catch (error) {
      return {success: false, error};
    }
  }
  static async findOne({query, model}) {
    // query can be for example {_id: id} , {status: "active"}
    try {
      const {doc, success} = await MongosFactory.findOne(model, query);
      return {success, doc};
    } catch (error) {
      return {success: false, error};
    }
  }

  static async update({id, model, data}) {
    try {
      let query = {_id: id};
      const {doc, success} = await MongosFactory.updateOne(model, query, data);
      return {success, doc};
    } catch (error) {
      return {success: false, error};
    }
  }

  static async delete({id, model}) {
    try {
      const {doc, success} = await MongosFactory.delete(model, id);
      return {success, doc};
    } catch (error) {
      return {success: false, error};
    }
  }
};
