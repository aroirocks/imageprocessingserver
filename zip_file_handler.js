var fs = require('fs');
var zip = new require('node-zip')();
const shortid = require('shortid');

shortid.characters(
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@'
);

function zip_file_return(dataArray) {
  return new Promise((resolve, reject) => {
    if (dataArray) {
      let final_path = `${__dirname}/ZipFolder/${shortid.generate()}.zip`;
      dataArray.map((data) => {
        let filepath = data.replace(/\\/g, '/').split('/');
        let filename = filepath[filepath.length - 1];
        zip.file(filename, fs.readFileSync(data));
      });

      var data = zip.generate({ base64: false, compression: 'DEFLATE' });
      fs.writeFile(final_path, data, 'binary', (err) => {
        if (err) {
          reject(err);
        }
        resolve(final_path);
      });
    }
    return;
  });
}
module.exports = zip_file_return;
