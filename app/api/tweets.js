'use strict';

const UserController = require('../controller/users');
const TweetController = require('../controller/tweets');
const ObjectUtil = require('../util/objectutil');
const JwtUtil = require('../util/jwtutil');
const Boom = require('boom');
const Joi = require('joi');

exports.findTweets = {
  auth: false,
  handler: function (request, reply) {
    UserController.getUser(request.params.username)
        .then(user =>  TweetController.readTweetsForUser(user))
        .then(tweets => {
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
        .then(user => TweetController.getSubscribedTweets(user))
        .then(tweets => {
          reply(ObjectUtil.getTweetsArray(tweets)).code(200);
        }).catch(err => {
          reply(Boom.badRequest('User not found'));
        });
  },
};

exports.tweet = {
  auth: 'jwt',
  validate: {
    payload: {
      text: Joi.string().max(140),
      image: Joi.any(),
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

    return TweetController.write(request, info.username)
        .then(tweet => {
          reply(tweet).code(201);
        }).catch(err => {
          reply(Boom.badImplementation('Internal Error'));
        });
  },
};

exports.remove = {
  auth: 'jwt',
  handler: function (request, reply) {
    const info = JwtUtil.decodeToken(request.headers.authorization);

    const tweets = request.query.tweets.split(',');

    if (info.isAdmin && tweets[0]) {
      TweetController.removeMultiple(tweets)
          .then(result => {
            reply().code(204);
          }).catch(err => {
        console.log(err);
        reply(Boom.badImplementation('Internal Error'));
      });
    } else if (tweets[0]) {
      TweetController.remove(tweets, info.username)
          .then(result => {
            reply().code(204);
          }).catch(err => {
        console.log(err);
        reply(Boom.badImplementation('Internal Error'));
      });
    }
  },
};

exports.removeAll = {
  auth: 'jwt',
  handler: function (request, reply) {
    const info = JwtUtil.decodeToken(request.headers.authorization);

    TweetController.removeAll(info.username)
        .then(result => {
          reply().code(204);
        }).catch(err => {
          reply(Boom.badImplementation('Internal Error'));
        });
  },
};
