'use strict';

const UserController = require('../controller/users');
const Joi = require('joi');

exports.settings = {
  handler: function (request, reply) {
    UserController.getUser(request.auth.credentials.loggedInUser).then(user => {
      reply.view('settings', {
        isLoggedIn: true,
        title: 'Settings',
        user: user,
      });
    });
  },
};

exports.changeSettings = {
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
    UserController.changeUser(request.auth.credentials.loggedInUser, request.payload)
        .then(result => {
          reply.redirect('/settings');
        }).catch(err => {
          reply.redirect('/settings');
          throw err;
        });
  },
};

exports.password = {
  handler: function (request, reply) {
    UserController.getUser(request.auth.credentials.loggedInUser).then(user => {
      reply.view('password', {
        isLoggedIn: true,
        title: 'Password Change',
        user: user,
      });
    });
  },
};

exports.changePassword = {
  validate: {
    payload: {
      password: Joi.string().min(8).max(40).required().trim(),
      passwordConfirm: Joi.string().trim().valid(Joi.ref('password')),
    },
  },
  handler: function (request, reply) {
    UserController.changePassword(request.auth.credentials.loggedInUser, request.payload);
    reply.redirect('/password');
  },
};
