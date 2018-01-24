'use strict';

exports.getSafeUserObject = function (user) {
  const result = {};

  result.id = user._id;
  result.username = user.username;
  result.displayname = user.displayname;
  result.email = user.email;
  result.joined = user.joined;
  result.description = user.description;
  result.subscribers = user.subscribers;

  if (user.image && user.image !== null) {
    result.image = '/img/' + user.image;
  } else {
    result.image = '/images/placeholder.png';
  }

  result.subscriptions = [];

  const subscriptions = user.subscriptions;

  for (let subscription of subscriptions) {
    result.subscriptions.push('/api/user/' + subscription.username);
  }

  return result;
};

exports.getSafeUserObjects = function (users) {
  const result = [];

  for (let user of users) {
    result.push(this.getSafeUserObject(user));
  }

  return result;
};

exports.getUserObjectForTweet = function (user) {
  const result = {};

  result.id = user._id;
  result.username = user.username;
  result.displayname = user.displayname;
  result.profile = '/api/user/' + user.username;

  if (user.image && user.image !== null) {
    result.image = '/img/' + user.image;
  } else {
    result.image = '/images/placeholder.png';
  }

  return result;
};

exports.getTweetsArray = function (tweets) {
  const array = [];

  for (let tweet of tweets) {
    const result = {};

    result.id = tweet._id;
    result.text = tweet.text;
    result.date = tweet.date;
    result.user = this.getUserObjectForTweet(tweet.user);

    if (tweet.image) {
      result.image = '/img/' + tweet.image;
    } else {
      result.image = null;
    }

    array.push(result);
  }

  return array;
};
