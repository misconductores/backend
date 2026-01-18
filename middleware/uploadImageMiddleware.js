const {filesConstants} = require('../constants');
const multer = require('multer');
const {GeneralErrorsFactory} = require('../factories');

const imageFileFilter = (req, file, next) => {
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

module.exports.uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: filesConstants.FILE_SIZE,
  },
  fileFilter: imageFileFilter,
});
