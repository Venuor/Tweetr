'use strict';

const User = require('../model/user');
const TweetController = require('./tweets');
const ImagesController = require('./images');
const bcrypt = require('bcrypt');

exports.signup = function (requestPayload) {
  if (!checkPassword(requestPayload))
    throw new Error('Passwords must match!');

  const user = new User(requestPayload);

  return hashPassword(user.password)
      .then(hash => {
        user.password = hash;
        return user.save();
      }).then(newUser => newUser)
      .catch(err => { throw err; });
};

exports.login = function (username, password) {
  let user = null;

  return User.findOne({ username: username })
      .then(foundUser => {
        user = foundUser;
        return bcrypt.compare(password, user.password);
      }).then(result => {
        if (result) {
          return user;
        } else {
          return Promise.resolve(null);
        }
      }).catch(err => {
        throw err;
      });
};

exports.getUser = function (username) {
  return User.findOne({ username: username })
      .then(foundUser => foundUser
      ).catch(err => {
        throw err;
      });
};

exports.getUserWithSubscriberNames = function (username) {
  return User.findOne({ username: username })
      .populate('subscriptions', 'username')
      .then(foundUser => foundUser)
      .catch(err => {
        throw err;
      });
};

exports.getAll = function () {
  return User.find({})
      .populate('subscriptions', 'username')
      .then(users => users)
      .catch(err => {
        throw err;
      });
};

exports.changePassword = function (username, payload) {
  if (!checkPassword(payload))
    throw new Error('Passwords must match!');

  return hashPassword(payload.password)
      .then(hash => User.update({ username: username }, { $set: { password: hash }, }))
      .then(result => result)
      .catch(error => error);
};

exports.changeUser = function (username, payload) {
  const displayname = payload.displayname;
  const email = payload.email;
  const description = payload.description;
  const image = payload.image;
  const setDefaultImage = payload.default_image;

  // check if image should be reset to default image
  if (setDefaultImage === 'false' || !setDefaultImage) {
    // check if new image should be set
    if (image !== undefined && image !== null && image.bytes > 0) {
      return this.getUser(username).then(foundUser => ImagesController.removeImage(foundUser.image))
          .then(deleted => ImagesController.saveImage(image.path, image.headers['content-type']))
          .then(image => {
            return imageChange(username, displayname, email, description, image._id);})
          .catch(err => {
            throw err;
          });
    } else {
      return simpleChange(username, displayname, email, description);
    }
  } else {
    return this.getUser(username).then(foundUser => {
      if (foundUser.image) {
        ImagesController.removeImage(foundUser.image);
      }

      return imageChange(username, displayname, email, description, null);
    });
  }
};

exports.subscribe = function (to, subscriber) {
  return User.findOneAndUpdate(
      { username: to, subscribers: { $ne: subscriber } },
      { $push: { subscribers: subscriber } })
      .then(to => {
        if (to) {
          return User.update({ username: subscriber }, { $push: { subscriptions: to.id } });
        } else {
          return null;
        }
      }).catch(err => {
        throw err;
      });
};

exports.unsubscribe = function (from, subscriber) {
  return User.findOneAndUpdate(
      { username: from, subscribers: subscriber },
      { $pull: { subscribers: subscriber } })
      .then(from => {
        if (from) {
          return User.update({ username: subscriber }, { $pull: { subscriptions: from.id } });
        } else {
          return null;
        }
      }).catch(err => {
        throw err;
      });
};

exports.removeUsers = function (users) {
  return User.find({ username: { $in: users } })
      .then(users => {
        const promises = [];

        users.forEach(user => {
          TweetController.removeAll(user.username)
              .then(tweets => promises.push(tweets))
              .catch(error => console.log(error));
          ImagesController.removeImage(user.image)
              .then(images => promises.push(images))
              .catch(error => console.log(error));
          user.subscriptions.forEach(subscription => {
            this.unsubscribe(subscription, user.username)
                .then(unsubscribe => promises.push(unsubscribe))
                .catch(error => console.log(error));
          });
          user.subscribers.forEach(subscriber => {
            this.unsubscribe(user.username, subscriber)
                .then(unsubscribe => promises.push(unsubscribe))
                .catch(error => console.log(error));
          });
          user.remove()
              .then(removed => promises.push(removed))
              .catch(error => console.log(error));
        });

        return Promise.all(promises);
      })
      .catch(err => {
        throw err;
      });
};

exports.createSocialGraph = async function (username) {
  const user = await getUserWithPopulatedSubscriptions(username);

  const nodes = [];
  const links = [];
  const visitedUsers = [];
  const usersToVisit = [user];

  while (usersToVisit.length > 0) {
    const currentUser = usersToVisit.pop();
    const currentUsername = currentUser.username;

    if (!visitedUsers.includes(currentUsername)) {
      for (const subscriptionUser of currentUser.subscriptions) {
        const subUsername = subscriptionUser.username;

        if (!visitedUsers.includes(subUsername)) {
          const populatedSubscription = await getUserWithPopulatedSubscriptions(subUsername);
          usersToVisit.push(populatedSubscription);
        }

        links.push({
          source: currentUsername,
          target: subUsername,
        });
      }

      visitedUsers.push(currentUsername);
      nodes.push({ name: currentUsername });
    }
  }

  return { links, nodes };
};

// **************************** //
//   private helper functions   //
// **************************** //

function checkPassword(payload) {
  return payload.password === payload.passwordConfirm;
}

function hashPassword(password) {
  const saltRounds = process.env.SALT_ROUNDS || 10;

  return bcrypt.hash(password, saltRounds)
      .then(hash => hash)
      .catch(error => console.log(error));
}

function simpleChange(username, displayname, email, description) {
  return User.update({ username: username },
      { $set: {
        displayname: displayname,
        email: email,
        description: description,
      },
  }).then(result => true)
      .catch(err => false);
}

function imageChange(username, displayname, email, description, imageId) {
  return User.update({ username: username },
      { $set: {
        displayname: displayname,
        email: email,
        description: description,
        image: imageId,
      },
  }).then(result => true)
      .catch(err => false);
}

async function getUserWithPopulatedSubscriptions(username) {
  return await User.findOne({ username: username })
      .populate('subscriptions')
      .then(user => user)
      .catch(err => console.log(error));
}
