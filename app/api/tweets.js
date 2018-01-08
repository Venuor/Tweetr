'use strict';

const UserController = require('../controller/users');
const TweetController = require('../controller/tweets');
const ObjectUtil = require('../util/objectutil');
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
          reply(Boom.badImplementation('error accessing db'));
        });
  },
};
