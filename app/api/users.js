'use strict';

const UserController = require('../controller/users');
const ObjectUtil = require('../util/objectutil');
const JwtUtil = require('../util/jwtutil');
const Boom = require('boom');
const Joi = require('joi');

exports.findUser = {
  auth: false,
  handler: function (request, reply) {
    UserController.getUserWithSubscriberNames(request.params.username)
        .then(user => {
          reply(ObjectUtil.getSafeUserObject(user)).code(200);
        }).catch(err => {
          reply(Boom.notFound('User not found'));
        });
  },
};

exports.findUserForToken = {
  auth: 'jwt',
  handler: function (request, reply) {
    const info = JwtUtil.decodeToken(request.headers.authorization);

    UserController.getUserWithSubscriberNames(info.username)
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
  validate: {
    payload: {
      username: Joi.string().min(4).max(20).alphanum().trim(),
      displayname: Joi.string().min(4).max(40).required().trim(),
      password: Joi.string().min(8).max(40).required().trim(),
      passwordConfirm: Joi.string().trim().valid(Joi.ref('password')),
      email: Joi.string().email().trim(),
    },
  },
  handler: function (request, reply) {
    UserController.signup(request.payload)
        .then(user => {
          reply(ObjectUtil.getSafeUserObject(user)).code(201);
        }).catch(err => {
          if (err.code === 11000) {
            reply(Boom.badRequest('Username or Email are already used!'));
          } else {
            reply(Boom.badImplementation('Internal Error'));
          }
        });
  },
};

exports.subscribe = {
  auth: 'jwt',
  handler: function (request, reply) {
    const info = JwtUtil.decodeToken(request.headers.authorization);

    const subscribeTo = request.params.username;
    const username = info.username;

    UserController.subscribe(subscribeTo, username)
        .then(result => {
          if (result) {
            reply().code(204);
          } else {
            reply(Boom.badRequest('User not found or already subscribed account!'));
          }
        }).catch(err => {
          reply(Boom.badImplementation('Internal Error'));
        });
  },
};

exports.unsubscribe = {
  auth: 'jwt',
  handler: function (request, reply) {
    const info = JwtUtil.decodeToken(request.headers.authorization);

    const unsubscribeFrom = request.params.username;
    const username = info.username;

    UserController.unsubscribe(unsubscribeFrom, username)
        .then(result => {
          if (result) {
            reply().code(204);
          } else {
            reply(Boom.badRequest('User not found or already subscribed account!'));
          }
        }).catch(err => {
          reply(Boom.badImplementation('Internal Error'));
        });
  },
};

exports.settings = {
  auth: 'jwt',
  validate: {
    payload: {
      displayname: Joi.string().min(4).max(40).trim(),
      email: Joi.string().email().trim(),
      description: Joi.string().allow('').max(140).trim(),
      image: Joi.any(),
      default_image: Joi.any(),
    },
  },
  payload: {
    output: 'file',
    parse: true,
    allow: 'multipart/form-data',
    maxBytes: 524288,
  },
  handler: function (request, reply) {
    const info = JwtUtil.decodeToken(request.headers.authorization);

    UserController.changeUser(info.username, request.payload)
        .then(result => {
          reply().code(204);
        }).catch(err => {
          reply(Boom.badImplementation('Internal Error'));
        });
  },
};

exports.password = {
  auth: 'jwt',
  validate: {
    payload: {
      password: Joi.string().min(8).max(40).required().trim(),
      passwordConfirm: Joi.string().trim().valid(Joi.ref('password')),
    },
  },
  handler: function (request, reply) {
    const info = JwtUtil.decodeToken(request.headers.authorization);

    UserController.changePassword(info.username, request.payload)
        .then(result => {
          reply().code(204);
        }).catch(err => {
          reply(Boom.badImplementation('Internal Error'));
        });
  },
};

exports.findAll = {
  auth: false,
  handler: function (request, reply) {
    UserController.getAll()
        .then(users => {
          reply(ObjectUtil.getSafeUserObjects(users)).code(200);
        })
        .catch(err => {
          reply(Boom.badImplementation('Internal Error'));
        });
  },
};

exports.removeUsers = {
  auth: 'jwt',
  handler: function (request, reply) {
    const info = JwtUtil.decodeToken(request.headers.authorization);

    if (!info.isAdmin) {
      reply(Boom.unauthorized('Unauthorized access to protected resource!'));
      return;
    }

    const users = request.query.users.split(',');

    UserController.removeUsers(users)
        .then(result => reply().code(204))
        .catch(err => {
          console.log(err);
          reply(Boom.badImplementation('Internal Error'));
        });
  },
};

exports.getSocialGraph = {
  auth: false,
  handler: async function (request, reply) {
    reply(await UserController.createSocialGraph(request.params.username));
  },
};
