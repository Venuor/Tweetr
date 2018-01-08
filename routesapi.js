'use strict';

const Users = require('./app/api/users');
const Tweets = require('./app/api/tweets');

module.exports = [

  { method: 'GET', path: '/api/user/{username}', config: Users.findUser },

  { method: 'GET', path: '/api/tweets',            config: Tweets.allTweets },
  { method: 'GET', path: '/api/tweets/{username}', config: Tweets.findTweets },
];
