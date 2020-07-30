const sharp = require('sharp');

module.exports = function compress_sharp(
  imagepath,
  compress,
  mimetype,
  new_file_path
) {
  const image = sharp(imagepath);
  let new_file_name = `${__dirname}/compress_output/${new_file_path}`;

  let quality = 100 - compress;

  let imagetype = mimetype['ext'].replace(/\'/gi, '');

  switch (imagetype) {
    case 'png':
      return new Promise((resolve, reject) => {
        image
          .png({
            quality: quality,
            compressionLevel: 9,
            force: true,
            progressive: true,
            adaptiveFiltering: true,
          })
          .withMetadata()
          .toFile(new_file_name, function (err) {
            //handle any error
            if (err) {
              reject('something bad happened');
            }
            console.log('PNG COMPRESS RAN');
            console.log('QUALITY:' + quality);
            resolve(new_file_name);
          });
      });
      break;
    case 'jpg':
    case 'jpeg':
      return new Promise((resolve, reject) => {
        image
          .jpeg({ quality: quality, force: false })
          .withMetadata()
          .toFile(new_file_name, function (err) {
            //handle any error
            if (err) {
              reject('something bad happened');
            }
            console.log('JPG COMPRESS RAN');
            resolve(new_file_name);
          });
      });
      break;
    case 'webp':
      return new Promise((resolve, reject) => {
        image
          .webp({ quality: 50, alphaQuality: 80, force: false })
          .withMetadata()
          .toFile(new_file_name, function (err) {
            //handle any error
            if (err) {
              reject('something bad happened');
            }
            console.log('WEBP COMPRESS RAN');
            resolve(new_file_name);
          });
      });
    case 'tiff':
      return new Promise((resolve, reject) => {
        image
          .tiff({ quality: 50 })
          .withMetadata()
          .toFile(new_file_name, function (err) {
            if (err) {
              reject('something bad happened');
            }
            console.log('TIFF COMPRESS RAN');
            resolve(new_file_name);
          });
      });
      break;
    default:
      return new Promise((resolve, reject) => {
        reject('something bad happened');
        console.log('NOTHING IN COMPRESS RAN');
      });
      break;
  }
};
