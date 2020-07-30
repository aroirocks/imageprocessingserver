const sharp = require('sharp');

module.exports = function (imagepath, compress, mimetype, new_file_path) {
  const image = sharp(imagepath);
  let new_file_name = `${__dirname}/uploads/${new_file_path}`;
  let quality = 100 - compress;

  return new Promise((resolve, reject) => {
    image
      .jpeg({ quality: quality, force: false })
      .withMetadata()
      .toFile(new_file_name, function (err) {
        //handle any error
        if (err) {
          reject('something bad happened');
        }
        resolve(new_file_name);
      });
  });
};
