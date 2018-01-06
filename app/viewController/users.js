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
    let isHome = false;
    let isLoggedIn = false;
    let loggedInUser = null;

    UserController.getUser(username)
        .then(foundUser => {
          user = foundUser;
          return TweetController.readTweetsForUser(foundUser);
        }).then(tweets => {
          if (request.auth.credentials !== null) {
            isLoggedIn = request.auth.credentials.loggedIn;
            isHome = user.username === request.auth.credentials.loggedInUser;
            loggedInUser = request.auth.credentials.loggedInUser;
          }

          reply.view('user',
          { title: 'Tweetr - ' + username,
            isLoggedIn: isLoggedIn,
            loggedInUser: loggedInUser,
            user: user,
            subs: user.subscribers + '',
            isHome: isHome,
            tweets: tweets,
          });
        });
  },
};
