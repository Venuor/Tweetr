'use strict';

const UserController = require('../controller/users');
const UserUtil = require('../util/userutil');
const Boom = require('boom');

exports.findUser = {
  auth: false,
  handler: function (request, reply) {
    UserController.getUserWithSubscriberNames(request.params.username)
        .then(user => {
          reply(UserUtil.getSafeUserObject(user)).code(200);
        }).catch(err => {
          reply(Boom.badImplementation('error accessing db'));
        });
  },
};
