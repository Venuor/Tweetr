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
