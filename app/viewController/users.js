'use strict';

const UserController = require('../controller/users');
const TweetController = require('../controller/tweets');
const Joi = require('Joi');

exports.index = {
  auth: false,
  handler: function (request, reply) {
    reply.view('index', { title: 'Tweetr', centered: true, index: true });
  },
};

exports.getSignup = {
  auth: false,
  handler: function (request, reply) {
    reply.view('signup', { title: 'Signup' });
  },
};

exports.signup = {
  auth: false,
  validate: {
    payload: {
      username: Joi.string().min(4).max(20).alphanum().trim(),
      displayname: Joi.string().min(8).max(40).required().trim(),
      password: Joi.string().min(8).max(40).required().trim(),
      passwordConfirm: Joi.string().trim().valid(Joi.ref('password')),
      email: Joi.string().email().trim(),
    },
  },
  handler: function (request, reply) {
    try {
      if (UserController.signup(request.payload)) {
        reply.redirect('/login');
      }
    } catch (err) {
      console.log(err);
      reply.redirect('/');
    }
  },
};

exports.getLogin = {
  auth: false,
  handler: function (request, reply) {
    reply.view('login', { title: 'Login' });
  },
};

exports.login = {
  auth: false,
  handler: function (request, reply) {
    UserController.login(request.payload.username, request.payload.password).then(result => {
      if (result) {
        request.cookieAuth.set({
          loggedIn: true,
          loggedInUser: request.payload.username,
        });
        reply.redirect('/home');
      } else {
        console.log('failed log in');
        reply.redirect('/login');
      }
    }).catch(err => {
      reply.redirect('/');
    });
  },
};

exports.logout = {
  handler: function (request, reply) {
    request.cookieAuth.clear();
    return reply.redirect('/');
  },
};

exports.home = {
  handler: function (request, reply) {
    reply.redirect('/user/' + request.auth.credentials.loggedInUser);
  },
};

exports.showUser = {
  auth: { strategy: 'standard', mode: 'try' },
  plugins: {
    'hapi-auth-cookie': {
      redirectTo: false,
    },
  },
  handler: function (request, reply) {
    const username = request.params.username;
    let user;
    let tweets;

    UserController.getUser(username)
        .then(foundUser => {
          user = foundUser;
          return TweetController.readTweetsForUser(foundUser);
        }).then(foundTweets => {
          tweets = foundTweets;
          return UserController.checkForLoggedInUser(request, user);
        }).then(result => {
          reply.view('user',
          { title: 'Tweetr - ' + username,
            isLoggedIn: result.isLoggedIn,
            loggedInUser: result.loggedInUser,
            followable: result.isFollowable,
            isFollowing: result.isFollowing,
            user: user,
            subs: user.subscribers + '',
            isHome: result.isHome,
            tweets: tweets,
          });
        }).catch(err => {
          console.log(err);
        });
  },
};

exports.subscribe = {
  handler: function (request, reply) {
    const subscribeTo = request.params.username;
    const username = request.auth.credentials.loggedInUser;

    UserController.subscribe(subscribeTo, username).then(result => {
      reply.redirect('/user/' + subscribeTo);
    });
  },
};

exports.unsubscribe = {
  handler: function (request, reply) {
    const unsubscribeFrom = request.params.username;
    const username = request.auth.credentials.loggedInUser;

    UserController.unsubscribe(unsubscribeFrom, username).then(result => {
      reply.redirect('/user/' + unsubscribeFrom);
    });
  },
};

exports.timeline = {
  handler: function (request, reply) {
    let user;

    UserController.getUser(request.auth.credentials.loggedInUser)
        .then(foundUser => {
          user = foundUser;
          return TweetController.getSubscribedTweets(user);
        }).then(tweets => {
          reply.view('user',
          { title: 'Tweetr - ' + user.username + '\'s timeline',
            isLoggedIn: true,
            loggedInUser: user.username,
            user: user,
            subs: user.subscribers + '',
            tweets: tweets,
          });
        });
  },
};

exports.globalTimeline = {
  auth: { strategy: 'standard', mode: 'try' },
  plugins: {
    'hapi-auth-cookie': {
      redirectTo: false,
    },
  },
  handler: function (request, reply) {

    TweetController.getAllTweets()
        .then(tweets => {
          let isLoggedIn = false;
          let loggedInUser;

          if (request.auth.credentials !== null) {
            isLoggedIn = request.auth.credentials.loggedIn;
            loggedInUser = request.auth.credentials.loggedInUser;
          }

          reply.view('global',
              { title: 'Tweetr - Global timeline',
                isLoggedIn: isLoggedIn,
                loggedInUser: loggedInUser,
                tweets: tweets,
              });
        });
  },
};
