'use strict';

const TweetController = require('../controller/tweets');
const Joi = require('joi');

exports.tweet = {
  auth: { strategy: 'standard' },
  validate: {
    payload: {
      text: Joi.string().max(140),
    },
  },
  handler: function (request, reply) {
    TweetController.write(request)
        .then(result => {
          reply.redirect('/home');
        }).catch(err => {
          reply.redirect('/home');
        });
  },
};

exports.removeTweet = {
  auth: { strategy: 'standard' },
  handler: function (request, reply) {
    try {
      if (TweetController.remove(request)) {
        reply.redirect('/home');
      }
    } catch (err) {
      console.log(err);
      reply.redirect('/home');
    }
  },
};

exports.removeAllTweets = {
  auth: { strategy: 'standard' },
  handler: function (request, reply) {
    TweetController.removeAll(request.auth.credentials.loggedInUser);
    reply.redirect('/settings');
  },
};