'use strict';

const UserController = require('../controller/users');
const ObjectUtil = require('../util/objectutil');
const Boom = require('boom');

exports.findUser = {
  auth: false,
  handler: function (request, reply) {
    UserController.getUserWithSubscriberNames(request.params.username)
        .then(user => {
          reply(ObjectUtil.getSafeUserObject(user)).code(200);
        }).catch(err => {
          reply(Boom.badRequest('User not found'));
        });
  },
};
