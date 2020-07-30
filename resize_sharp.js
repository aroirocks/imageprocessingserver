const sharp = require('sharp');
const fs = require('fs');

module.exports = function resize_sharp(filepath, width, height, savefile) {
  savefile = `${__dirname}/resize_output/${savefile}`;

  console.log('save_file: ' + savefile);
  if (width == 0 && height != 0) {
    return new Promise((resolve, reject) => {
      sharp(filepath)
        .resize({ height: height })
        .toBuffer(function (err, buffer) {
          fs.writeFile(savefile, buffer, function (e) {
            if (e) {
              reject('something broke');
            }
            resolve(savefile);
          });
        });
    });
  }
  if (width != 0 && height == 0) {
    return new Promise((resolve, reject) => {
      sharp(filepath)
        .resize({ width: width })
        .toBuffer(function (err, buffer) {
          fs.writeFile(savefile, buffer, function (e) {
            if (e) {
              reject('something broke');
            }
            resolve(savefile);
          });
        });
    });
  }
  if (width != 0 && height != 0) {
    return new Promise((resolve, reject) => {
      sharp(filepath)
        .resize(width, height)
        .toBuffer(function (err, buffer) {
          fs.writeFile(savefile, buffer, function (e) {
            if (e) {
              reject('something broke');
            }
            resolve(savefile);
          });
        });
    });
  }
};
