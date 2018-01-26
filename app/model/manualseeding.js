'use strict';

const User = require('./user');
const Tweet = require('./tweet');
const Image = require('./image');
const bcrypt = require('bcrypt');

exports.seed = function () {
  return clearCollections()
      .then(result => fillCollections())
      .catch(error => console.log(error));
};

function clearCollections() {
  const promises = [];

  User.remove({})
      .then(result => promises.push(result))
      .catch(err => console.log(error));

  Tweet.remove({})
      .then(result => promises.push(result))
      .catch(err => console.log(error));

  Image.remove({})
      .then(result => promises.push(result))
      .catch(err => console.log(error));

  return Promise.all(promises);
}

function fillCollections() {
  const promises = [];

  hashPassword('password')
      .then(hash =>
        new User({
          username: 'admin',
          displayname: 'admin',
          email: 'admin@example.com',
          password: hash,
          isAdmin: true,
        }).save()
      ).then(user =>
        new Tweet({
          user: user.id,
          text: 'Lets make this thing big!',
        }).save()
      ).then(tweet => promises.push(tweet));

  hashPassword('password')
      .then(hash =>
        new User({
          username: 'venour',
          displayname: 'Rouven Spieß',
          email: 'venour@example.com',
          password: hash,
        }).save()
      ).then(user =>
        new Tweet({
          user: user.id,
          text: 'Hello World',
        }).save()
      ).then(tweet => promises.push(tweet));

  hashPassword('password')
      .then(hash =>
        new User({
          username: 'user',
          displayname: 'user',
          email: 'user@example.com',
          password: hash,
        }).save()
      ).then(user =>
        new Tweet({
          user: user.id,
          text: 'This was not supposed to happen',
        }).save()
      ).then(tweet => promises.push(tweet));

  return Promise.all(promises);
}

function hashPassword(password) {
  const saltRounds = process.env.SALT_ROUNDS || 10;

  return bcrypt.hash(password, saltRounds)
      .then(hash => hash)
      .catch(error => console.log(error));
}
