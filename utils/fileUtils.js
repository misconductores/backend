const config = require('config');
const {Upload} = require('@aws-sdk/lib-storage');
const {S3Client, DeleteObjectCommand} = require('@aws-sdk/client-s3');
const {filesConstants} = require('../constants');
const {GeneralErrorsFactory} = require('../factories');

const accessKeyId = config.get('awsAccessKey');
const secretAccessKey = config.get('awsSecretAccessKey');
const Bucket = config.get('awsBucket');
const region = config.get('awsBucketRegion');

const credentials = {accessKeyId, secretAccessKey};
const client = new S3Client({credentials, region});

module.exports.uploadFile = async ({filePath, fileName, file}) => {
  try {
    const args = {
      client,
      params: {Bucket, Body: file, Key: filePath},
    };
    const upload = new Upload(args);
    const data = await upload.done();
    return {url: data.Location, key: data.Key, name: fileName};
  } catch (err) {
    loggerMiddleware.error(err);
    throw err;
  }
};

module.exports.deleteFile = async ({key}) => {
  try {
    const command = new DeleteObjectCommand({Bucket, Key: key});
    await client.send(command);
    return key;
  } catch (err) {
    loggerMiddleware.error(err);
    throw err;
  }
};

module.exports.fileFilter = (req, file, next) => {
  const timestamp = Date.now();
  const originalname = file.originalname;
  const newFilename = `${timestamp}-${originalname.replace(/\s+/g, '_')}`;
  file.nameWithTimestamp = newFilename;

  const allowedMimetype = Object.values(
    filesConstants.ALLOWED_PROFILE_IMAGE_MIMETYPE
  );

  const isFileAllowed = allowedMimetype.some((allowedType) =>
    file.mimetype.startsWith(allowedType)
  );

  if (isFileAllowed) {
    next(null, true);
  } else {
    return next(GeneralErrorsFactory.invalidFileFormat());
  }
};

module.exports.documentFilter = (req, file, next) => {
  const timestamp = Date.now();
  const originalname = file.originalname;
  const newFilename = `${timestamp}-${originalname.replace(/\s+/g, '_')}`;
  file.nameWithTimestamp = newFilename;

  const allowedMimetype = Object.values(
    filesConstants.ALLOWED_DOCUMENT_FILE_MIMETYPE
  );

  const isFileAllowed = allowedMimetype.some((allowedType) =>
    file.mimetype.startsWith(allowedType)
  );

  if (isFileAllowed) {
    next(null, true);
  } else {
    return next(GeneralErrorsFactory.invalidFileFormat());
  }
};
