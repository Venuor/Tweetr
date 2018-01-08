'use strict';

const UserController = require('../controller/users');
const TweetController = require('../controller/tweets');
const ObjectUtil = require('../util/objectutil');
const JwtUtil = require('../util/jwtutil');
const Boom = require('boom');

exports.findTweets = {
  auth: false,
  handler: function (request, reply) {
    UserController.getUser(request.params.username)
        .then(user => {
          return TweetController.readTweetsForUser(user);
        }).then(tweets => {
          reply(ObjectUtil.getTweetsArray(tweets)).code(200);
        }).catch(err => {
          reply(Boom.badRequest('User not found'));
        });
  },
};

exports.allTweets = {
  auth: false,
  handler: function (request, reply) {
    TweetController.getAllTweets()
        .then(tweets => {
          reply(ObjectUtil.getTweetsArray(tweets)).code(200);
        }).catch(err => {
          reply(Boom.badImplementation('error accessing db'));
        });
  },
};

exports.timeline = {
  auth: 'jwt',
  handler: function (request, reply) {
    const info = JwtUtil.decodeToken(request.headers.authorization);
    UserController.getUser(info.username)
        .then(user => {
          return TweetController.getSubscribedTweets(user);
        }).then(tweets => {
          reply(ObjectUtil.getTweetsArray(tweets)).code(200);
        }).catch(err => {
          reply(Boom.badRequest('User not found'));
        });
  },
};
