'use strict';

const Users = require('./app/api/users');
const Tweets = require('./app/api/tweets');

module.exports = [

  { method: 'POST', path: '/api/login',           config: Users.login },
  { method: 'GET',  path: '/api/user/{username}', config: Users.findUser },
  { method: 'POST', path: '/api/user/{username}', config: Users.signup },
  { method: 'PUT',  path: '/api/user/{username}', config: Users.settings },
  { method: 'POST', path: '/api/user/{username}/password', config: Users.password },
  { method: 'POST', path: '/api/user/{username}/subscribe', config: Users.subscribe },
  { method: 'POST', path: '/api/user/{username}/unsubscribe', config: Users.unsubscribe },

  { method: 'GET',    path: '/api/tweets', config: Tweets.allTweets },
  { method: 'POST',   path: '/api/tweets', config: Tweets.tweet },
  { method: 'DELETE', path: '/api/tweets', config: Tweets.remove },
  { method: 'GET',    path: '/api/tweets/{username}', config: Tweets.findTweets },
  { method: 'DELETE', path: '/api/tweets/{username}', config: Tweets.removeAll },
  { method: 'GET',    path: '/api/tweets/{username}/timeline', config: Tweets.timeline },
];
