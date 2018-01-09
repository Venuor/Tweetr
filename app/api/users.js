'use strict';

const UserController = require('../controller/users');
const ObjectUtil = require('../util/objectutil');
const JwtUtil = require('../util/jwtutil');
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

exports.login = {
  auth: false,
  handler: function (request, reply) {
    UserController.login(request.payload.username, request.payload.password)
        .then(user => {
          if (user) {
            const token = JwtUtil.createToken(user);
            reply({ success: true, token: token }).code(200);
          } else {
            reply({ success: false, message: 'Authentication failed' }).code(400);
          }
        }).catch(err => {
          reply(Boom.badImplementation('Internal Error'));
        });
  },
};

exports.signup = {
  auth: false,
  handler: function (request, reply) {
    UserController.signup(request.payload)
        .then(user => {
          reply(ObjectUtil.getSafeUserObject(user)).code(201);
        }).catch(err => {
          if (err.code === 11000) {
            reply(Boom.badRequest('Username, Display name or Email are already used!'));
          } else {
            reply(Boom.badImplementation('Internal Error'));
          }
        });
  },
};
