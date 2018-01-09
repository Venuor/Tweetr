'use strict';

const Users = require('./app/api/users');
const Tweets = require('./app/api/tweets');

module.exports = [

  { method: 'POST', path: '/api/signup',          config: Users.signup },
  { method: 'POST', path: '/api/login',           config: Users.login },
  { method: 'GET',  path: '/api/user/{username}', config: Users.findUser },
  { method: 'POST', path: '/api/user/{username}', config: Tweets.tweet },

  { method: 'GET', path: '/api/tweets',            config: Tweets.allTweets },
  { method: 'GET', path: '/api/tweets/{username}', config: Tweets.findTweets },
  { method: 'GET', path: '/api/timeline',          config: Tweets.timeline },
];
