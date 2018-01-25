'use strict';

const User = require('./user');
const Tweet = require('./tweet');
const Image = require('./image');

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

  new User({
    username: 'admin',
    displayname: 'admin',
    email: 'admin@example.com',
    password: 'password',
    isAdmin: true,
  }).save().then(user =>
    new Tweet({
      user: user.id,
      text: 'Lets make this thing big!',
    }).save()
  ).then(tweet => promises.push(tweet));

  new User({
    username: 'venour',
    displayname: 'Rouven Spieß',
    email: 'venour@example.com',
    password: 'password',
  }).save().then(user =>
    new Tweet({
      user: user.id,
      text: 'Hello World',
    }).save()
  );

  new User({
    username: 'user',
    displayname: 'user',
    email: 'user@example.com',
    password: 'password',
  }).save().then(user =>
    new Tweet({
      user: user.id,
      text: 'This was not supposed to happen',
    }).save()
  );

  return Promise.all(promises);
}
