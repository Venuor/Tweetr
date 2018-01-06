'use strict';

const UserController = require('./users');
const Tweet = require('../model/tweet');

exports.write = function (request) {
  let data = request.payload;
  return UserController.getUser(request.auth.credentials.loggedInUser)
      .then(user => {
        data.user = user.id;

        const tweet = new Tweet(data);
        return tweet.save();
      }).then(newTweet => {
        return true;
      }).catch(err => {
        throw err;
      });
};

exports.readTweetsForUser = function (user) {
  return Tweet.find({ user: { $in: user.id } })
      .sort({ 'date': 'desc' })
      .populate('user')
      .then(tweets => {
        return tweets;
      }).catch(err => {
        throw err;
      });
};

exports.remove = function (request) {
  return UserController.getUser(request.auth.credentials.loggedInUser)
      .then(user => {
        return Tweet.remove({ user: user.id, _id: request.params.id });
      }).then(deleted => {
        return true;
      }).catch(err => {
        throw err;
      });
};

exports.removeAll = function (username) {
  return UserController.getUser(username)
      .then(user => {
        return Tweet.remove({ user: user.id });
      }).then(deleted => {
        return true;
      }).catch(err => {
        throw err;
      });
};

exports.getSubscribedTweets = function (user) {
  return Tweet.find({ user: { $in: user.subscriptions } })
      .sort({ 'date': 'desc' })
      .populate('user')
      .then(tweets => {
        return tweets;
      }).catch(err => {
        throw err;
      });
};
