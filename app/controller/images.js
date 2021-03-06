'use strict';

const Image = require('../model/image');
const fs = require('fs');

exports.findImageById = function (id) {
  return Image.findOne({ _id: id }).then(image => image)
      .catch(err => {
        throw err;
      });
};

exports.saveImage = function (path, type) {
  const image = new Image();
  image.data = fs.readFileSync(path);
  image.type = type;

  return image.save();
};

exports.removeImage = function (id) {
  return this.removeImages(id);
};

exports.removeImages = function (ids) {
  return Image.remove({ _id: { $in: ids } })
      .then(deleted => true)
      .catch(err => false);
};
