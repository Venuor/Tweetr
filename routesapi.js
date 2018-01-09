'use strict';

const Users = require('./app/api/users');
const Tweets = require('./app/api/tweets');

module.exports = [

  { method: 'POST', path: '/api/signup',          config: Users.signup },
  { method: 'POST', path: '/api/login',           config: Users.login },
  { method: 'GET',  path: '/api/user/{username}', config: Users.findUser },
  { method: 'POST', path: '/api/user/{username}', config: Tweets.tweet },
  { method: 'POST', path: '/api/user/{username}/subscribe', config: Users.subscribe },
  { method: 'POST', path: '/api/user/{username}/unsubscribe', config: Users.unsubscribe },

  { method: 'GET', path: '/api/tweets',            config: Tweets.allTweets },
  { method: 'GET', path: '/api/tweets/{username}', config: Tweets.findTweets },
  { method: 'GET', path: '/api/timeline',          config: Tweets.timeline },

  { method: 'POST', path: '/api/tweet/remove/{id}', config: Tweets.remove },
  { method: 'POST', path: '/api/tweet/removeall',   config: Tweets.removeAll },

  { method: 'POST', path: '/api/settings', config: Users.settings },
  { method: 'POST', path: '/api/password', config: Users.password },
];
