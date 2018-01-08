'use strict';

const UserController = require('./users');
const ImageController = require('./images');
const Tweet = require('../model/tweet');

exports.write = function (request, username) {
  const text = request.payload.text;
  const image = request.payload.image;

  return UserController.getUser(username)
      .then(user => {
        if (image !== undefined && image !== null && image.bytes > 0) {
          return saveImageThenTweet(user.id, text, image);
        } else {
          return saveTweet(user.id, text);
        }
      }).then(newTweet => {
        return newTweet;
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
        return Tweet.findOneAndRemove({ user: user.id, _id: request.params.id });
      }).then(deleted => {
        if (deleted.image) {
          return ImageController.removeImage(deleted.image);
        } else {
          return new Promise.resolve(null);
        }
      }).then(promise => {
        return true;
      }).catch(err => {
        throw err;
      });
};

exports.removeAll = function (username) {
  let user;
  return UserController.getUser(username)
      .then(foundUser => {
        user = foundUser;
        return Tweet.find({ user: user.id });
      }).then(tweets => {
        removeTweets(user.id);
        return ImageController.removeImages(tweets.map(a => a.image));
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

exports.getAllTweets = function () {
  return Tweet.find({})
      .sort({ 'date': 'desc' })
      .populate('user')
      .then(tweets => {
        return tweets;
      }).catch(err => {
        throw err;
      });
};

// **************************** //
//   private helper functions   //
// **************************** //

function saveTweet(userId, text, imageId = null) {
  const data = {};
  data.user = userId;
  data.text = text;
  data.image = imageId;

  const tweet = new Tweet(data);
  return tweet.save();
}

function saveImageThenTweet(userId, text, image) {
  return ImageController.saveImage(image.path, image.headers['content-type'])
      .then(image => {
        return saveTweet(userId, text, image.id);
      }).catch(err => {
        throw err;
      });
}

function removeTweets(userId) {
  return Tweet.remove({ user: userId })
      .then(deleted => {
        return true;
      }).catch(err => {
        throw err;
      });
}
