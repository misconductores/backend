const {GeneralEntityFactory} = require('./entities');

module.exports.create = async (model, data, session) => {
  let savedData;

  if (Array.isArray(data)) {
    savedData = await model.create(data, {session});
  } else {
    const doc = new model(data);
    savedData = await doc.save({session});
  }

  const args = {data: savedData};
  const doc = GeneralEntityFactory.cleanMongooseData(args);

  return {success: !!savedData, doc};
};

module.exports.updateOne = async (model, query, data, session) => {
  const updateArgs = {new: true, session};
  const updatedDoc = await model.findOneAndUpdate(query, data, updateArgs);
  let doc = null;

  if (updatedDoc) {
    const args = {data: updatedDoc};
    doc = GeneralEntityFactory.cleanMongooseData(args);
  }

  return {success: true, doc};
};

module.exports.UpdateById = async (model, query, data) => {
  const updatedDoc = await model.findByIdAndUpdate(query, data, {new: true});
  let doc = null;
  if (data) {
    const args = {data: updatedDoc};
    doc = GeneralEntityFactory.cleanMongooseData(args);
  }

  return {success: true, doc};
};

module.exports.findById = async (model, id, popOptions) => {
  let doc = popOptions
    ? await model.findById(id).populate(popOptions)
    : await model.findById(id);

  if (doc) doc = GeneralEntityFactory.cleanMongooseData({data: doc});

  return {success: true, doc};
};

module.exports.UpdateDocumentsById = async (model, query, data) => {
  const updatedDoc = await model.findByIdAndUpdate(
    query,
    {$push: {documents: data}},
    {new: true}
  );
  let doc = null;
  if (data) {
    const args = {data: updatedDoc};
    doc = GeneralEntityFactory.cleanMongooseData(args);
  }

  return {success: true, doc};
};

module.exports.deleteDocumentsById = async (model, query, data) => {
  const updatedDoc = await model.findByIdAndUpdate(
    query,
    {$pull: {documents: {label: data}}},
    {new: true}
  );
  let doc = null;
  if (data) {
    const args = {data: updatedDoc};
    doc = GeneralEntityFactory.cleanMongooseData(args);
  }

  return {success: true, doc};
};

module.exports.updateMany = async (model, query, data, session) => {
  const updateArgs = {new: true, session};
  const updatedDocs = await model.updateMany(query, data, updateArgs);
  let docs = [];

  if (updatedDocs.length > 0) {
    const args = {data: updatedDocs};
    docs = GeneralEntityFactory.cleanMongooseData(args);
  }

  return {success: true, docs};
};

module.exports.findOne = async (model, query, popOpts) => {
  let doc = await model.findOne(query).populate(popOpts || '');

  if (doc) doc = GeneralEntityFactory.cleanMongooseData({data: doc});

  return {success: true, doc};
};

module.exports.find = async (model, query) => {
  let docs = await model.find(query);

  if (docs) docs = GeneralEntityFactory.cleanMongooseData({data: docs});

  return {success: true, docs};
};

module.exports.delete = async (model, id) => {
  const deletedDoc = await model.findOneAndDelete({_id: id});

  let doc;
  if (deletedDoc) {
    const args = {data: deletedDoc};
    doc = GeneralEntityFactory.cleanMongooseData(args);
  }

  return {success: true, doc};
};
