const sharp = require('sharp');

module.exports = function convert_sharp(convertTo, filepath, filename, ext) {
  let file_path = `${__dirname}/convert_output/${filename}.${ext}`;
  return new Promise((resolve, reject) => {
    sharp.cache(false); //only for windows
    const data = sharp(filepath)
      .toFormat(convertTo)
      .toFile(file_path, (err) => {
        if (err) {
          console.log(err);
        }
        console.log('CONVERT_SHARP RAN');
        resolve(file_path);
      });
  });
};
