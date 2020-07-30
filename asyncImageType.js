const FileType = require('file-type');
module.exports = async function imgtype(img) {
  var file_type = await FileType.fromFile(img);
  return file_type;
};
