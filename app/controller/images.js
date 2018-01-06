'use strict';

const Image = require('../model/image');
const fs = require('fs');

exports.findImageById = function (id) {
  return Image.findOne({ id: id }).then(image => {
    return image;
  }).catch(err => {
    throw err;
  });
};

exports.saveImage = function (path, type) {
  console.log(path);
  const image = new Image();
  image.data = fs.readFileSync(path);
  image.type = type;

  return image.save();
};

exports.removeImage = function (id) {
  return Image.remove({ id: id })
      .then(deleted => {
        return true;
      }).catch(err => {
        return false;
      });
};
