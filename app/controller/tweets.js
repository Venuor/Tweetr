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
      }).then(newTweet =>  newTweet)
      .catch(err => {
        throw err;
      });
};

exports.readTweetsForUser = function (user) {
  return Tweet.find({ user: { $in: user.id } })
      .sort({ date: 'desc' })
      .populate('user')
      .then(tweets =>  tweets)
      .catch(err => {
        throw err;
      });
};

exports.remove = function (tweetId, username) {
  return UserController.getUser(username)
      .then(user => Tweet.findOneAndRemove({ user: user.id, _id: tweetId }))
      .then(deleted => {
        if (deleted === undefined || deleted === null) {
          return null;
        } else if (deleted.image) {
          return ImageController.removeImage(deleted.image);
        } else {
          return true;
        }
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
        const promises = [];
        removeTweets(user.id)
            .then(result => promises.push(result));
        ImageController.removeImages(tweets.map(a => a.image))
            .then(result => promises.push(result));
        return Promise.all(promises);
      }).catch(err => {
        throw err;
      });
};

exports.removeMultiple = function (tweets) {
  return Tweet.find({ _id: { $in: tweets } })
      .then(tweets => {
        const promises = [];

        tweets.forEach(tweet => {
          ImageController.removeImage(tweet.image)
              .then(result => promises.push(result));
          tweet.remove()
              .then(result => promises.push(result));
        });

        return Promise.all(promises);
      }).catch(err => {
        throw err;
      });
};

exports.getSubscribedTweets = function (user) {
  return Tweet.find({ user: { $in: user.subscriptions } })
      .sort({ date: 'desc' })
      .populate('user')
      .then(tweets => tweets)
      .catch(err => {
        throw err;
      });
};

exports.getAllTweets = function () {
  return Tweet.find({})
      .sort({ date: 'desc' })
      .populate('user')
      .then(tweets =>  tweets)
      .catch(err => {
        throw err;
      });
};

exports.getTweetsForUsers = function (users) {
  return Tweet.find({})
      .sort({ date: 'desc' })
      .populate({
        path: 'user',
        match: { username: { $in: users } },
      })
      .then(tweets => tweets)
      .catch(err => {
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
      .then(image => saveTweet(userId, text, image.id))
      .catch(err => {
        throw err;
      });
}

function removeTweets(userId) {
  return Tweet.remove({ user: userId })
      .then(deleted => deleted)
      .catch(err => {
        throw err;
      });
}
