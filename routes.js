'use strict';

const Users = require('./app/viewController/users');
const Tweets = require('./app/viewController/tweets');
const Images = require('./app/viewController/images');
const Settings = require('./app/viewController/settings');
const Assets = require('./app/viewController/assets');

module.exports = [

  { method: 'GET', path: '/', config: Users.index },

  { method: 'GET',  path: '/signup', config: Users.getSignup },
  { method: 'POST', path: '/signup', config: Users.signup },

  { method: 'GET',  path: '/login', config: Users.getLogin },
  { method: 'POST', path: '/login', config: Users.login },
  { method: 'GET',  path: '/logout', config: Users.logout },

  { method: 'GET',  path: '/home',            config: Users.home },
  { method: 'GET',  path: '/user/{username}', config: Users.showUser },
  { method: 'POST', path: '/user/{username}', config: Tweets.tweet },
  { method: 'POST', path: '/user/{username}/subscribe', config: Users.subscribe },
  { method: 'POST', path: '/user/{username}/unsubscribe', config: Users.unsubscribe },

  { method: 'GET', path: '/timeline', config: Users.timeline },

  { method: 'GET',  path: '/tweet/remove/{id}', config: Tweets.removeTweet },
  { method: 'POST', path: '/tweet/removeAll',   config: Tweets.removeAllTweets },

  { method: 'GET', path: '/img/{image}', config: Images.image },

  { method: 'GET',  path: '/settings', config: Settings.settings },
  { method: 'POST', path: '/settings', config: Settings.changeSettings },
  { method: 'GET',  path: '/password', config: Settings.password },
  { method: 'POST', path: '/password', config: Settings.changePassword },

  {
    method: 'GET',
    path: '/{param*}',
    config: { auth: false },
    handler: Assets.servePublicDirectory,
  },
];
