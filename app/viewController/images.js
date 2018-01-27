'use strict';

const ImageController = require('../controller/images');

exports.image = {
  auth: false,
  handler: function (request, reply) {
    ImageController.findImageById(request.params.id).then(image => {
      reply(image.data).header('Content-type', image.type);
    }).catch(err => {
      reply(Boom.badRequest('Image id invalid'));
    });
  },
};
