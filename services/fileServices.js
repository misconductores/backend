const {filesUtils} = require('../utils');

module.exports = class FilesServices {
  static async uploadSingleFile({file, fileDir}) {
    const fileObj = await filesUtils.uploadFile({
      filePath: `${fileDir}/${file.nameWithTimestamp}`,
      fileName: file.originalname,
      file: file.buffer,
    });
    return fileObj;
  }

  static async deleteSingleFile({file}) {
    await filesUtils.deleteFile({key: file});
  }

  static async uploadFiles({files, fileDir}) {
    const filesUrl = [];
    for (const file of files) {
      const fileObj = await filesUtils.uploadFile({
        filePath: `${fileDir}/${file.nameWithTimestamp}`,
        fileName: file.originalname,
        file: file.buffer,
      });
      filesUrl.push(fileObj);
    }
    return filesUrl;
  }

  static async deleteFiles({files}) {
    const filesArr = Array.isArray(files) ? files : [files];
    const deletedFiles = [];
    for (const file of filesArr) {
      const deletedFile = await filesUtils.deleteFile({key: file.key});
      deletedFiles.push(deletedFile);
    }
    return deletedFiles;
  }
};
