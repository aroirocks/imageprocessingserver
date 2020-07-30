var express = require('express');
const imgType = require('./asyncImageType');
const compress_sharp = require('./compress_sharp');
const convert_sharp = require('./convert_sharp');
const resize_sharp = require('./resize_sharp');
var router = express.Router();
const zip_file_return = require('./zip_file_handler');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/tiff': 'tiff',
};

router.post('/processall', (req, res) => {
  let { data, compress, convertFrom, convertTo, width, height } = req.body;

  let resizeHeight = parseInt(height);
  let resizeWidth = parseInt(width);
  if (convertTo === 'None') {
    convertTo = 0;
  }
  let fileArray = [];
  let data_length = data.length;
  data.map((data) => {
    let requested_file = data.replace('70x70.', '.');
    let requested_file_path = `${__dirname}/uploads/${requested_file}`;
    let new_file_path = data.replace(/\____(.*)\./, '.');

    let mimeType;
    let filepath;
    let file_name_for_resize = new_file_path;

    imgType(requested_file_path).then((mimetype) => {
      mimeType = mimetype['ext'];
      process_image(
        requested_file_path,
        compress,
        mimetype,
        new_file_path,
        convertTo,
        resizeWidth,
        resizeHeight
      ).then((value) => {
        fileArray.push(value);
        if (fileArray.length === data_length) {
          zip_file_return(fileArray).then((zipFile) => res.download(zipFile));
        }
      });

      async function process_image(
        requested_file_path,
        compress,
        mimetype,
        new_file_path,
        convertTo,
        resizeWidth,
        resizeHeight
      ) {
        let final_path;
        // compress

        if (compress > 0) {
          let value = await compress_sharp(
            requested_file_path,
            compress,
            mimetype,
            new_file_path
          );
          filepath = value;
          final_path = value;
        }

        // convert
        if (convertTo != 0) {
          let value;
          let removefileType = /\.([^\.]*)$/;
          let originalfilename = removefileType.exec(new_file_path);
          let converted_file_name = new_file_path.replace(
            originalfilename[0],
            ''
          );
          if (filepath) {
            value = await convert_sharp(
              convertTo,
              filepath,
              converted_file_name,
              convertTo
            );
          } else {
            value = await convert_sharp(
              convertTo,
              requested_file_path,
              converted_file_name,
              convertTo
            );
          }

          filepath = value;
          final_path = value;
          file_name_for_resize = file_name_for_resize.split('.');
          let tempfilename;
          if (file_name_for_resize.length >= 3) {
            //dosomething
            for (let i = 0; i < file_name_for_resize.length; i++) {
              if (i < file_name_for_resize.length - 1) {
                if (i == 0) {
                  tempfilename += file_name_for_resize[i];
                } else {
                  tempfilename += '.' + file_name_for_resize[i];
                }
              }
            }
            tempfilename += '.' + convertTo;
            file_name_for_resize = tempfilename;
          } else {
            tempfilename = file_name_for_resize[0] + '.' + convertTo;
            file_name_for_resize = tempfilename;
          }
        }

        // Resize
        if (resizeHeight != 0 || resizeWidth != 0) {
          let value;
          new_file_path = `${__dirname}/uploads/${requested_file}`;

          if (filepath) {
            console.log('filepath ran');
            console.log('file_name_for_resize: ' + file_name_for_resize);

            value = await resize_sharp(
              filepath,
              resizeWidth,
              resizeHeight,
              file_name_for_resize
            );
          } else {
            console.log('new_filepath ran');
            console.log('new_filepath: ' + new_file_path);
            value = await resize_sharp(
              new_file_path,
              resizeWidth,
              resizeHeight,
              file_name_for_resize
            );
          }

          filepath = value;
          final_path = value;
        }
        return final_path;
      }
    });
  });

  //convertTo

  //Resize
});

module.exports = router;
