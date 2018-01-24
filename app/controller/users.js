'use strict';

const User = require('../model/user');
const ImagesController = require('../controller/images');

exports.signup = function (requestPayload) {
  if (!checkPassword(requestPayload))
    throw new Error('Passwords must match!');

  const user = new User(requestPayload);

  return user.save()
      .then(newUser => newUser)
      .catch(err => { throw err; });
};

exports.login = function (username, password) {
  return User.findOne({ username: username, password: password })
      .then(foundUser => {
        return foundUser;
      }).catch(err => {
        throw err;
      });
};

exports.getUser = function (username) {
  return User.findOne({ username: username })
      .then(foundUser => {
        return foundUser;
      }).catch(err => {
        throw err;
      });
};

exports.getUserWithSubscriberNames = function (username) {
  return User.findOne({ username: username })
      .populate('subscriptions', 'username')
      .then(foundUser => {
        return foundUser;
      }).catch(err => {
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

  return User.update({ username: username }, { $set: { password: payload.password }, })
      .then(result => {
        return true;
      }).catch(err => {
        return false;
      });
};

exports.changeUser = function (username, payload) {
  const displayname = payload.displayname;
  const email = payload.email;
  const description = payload.description;
  const image = payload.image;
  const setDefaultImage = payload.default_image;

  // check if image should be reset to default image
  if (!setDefaultImage) {
    // check if new image should be set
    if (image !== undefined && image !== null && image.bytes > 0) {
      return this.getUser(username).then(foundUser => {
        return ImagesController.removeImage(foundUser.image);
      }).then(deleted => {
        return ImagesController.saveImage(image.path, image.headers['content-type']);
      }).then(image => {
        return imageChange(username, displayname, email, description, image.id);
      }).catch(err => {
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

// **************************** //
//   private helper functions   //
// **************************** //

function checkPassword(payload) {
  return payload.password === payload.passwordConfirm;
}

function simpleChange(username, displayname, email, description) {
  return User.update({ username: username },
      { $set: {
        displayname: displayname,
        email: email,
        description: description,
      },
  }).then(result => {
    return true;
  }).catch(err => {
    return false;
  });
}

function imageChange(username, displayname, email, description, imageId) {
  return User.update({ username: username },
      { $set: {
        displayname: displayname,
        email: email,
        description: description,
        image: imageId,
      },
  }).then(result => {
    return true;
  }).catch(err => {
    return false;
  });
}
