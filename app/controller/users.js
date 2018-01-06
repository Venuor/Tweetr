'use strict';

const User = require('../model/user');
const ImagesController = require('../controller/images');

exports.signup = function (requestPayload) {
  if (!checkPassword(requestPayload))
    throw new Error('Passwords must match!');

  const user = new User(requestPayload);

  return user.save()
      .then(newUser => true)
      .catch(err => { throw err; });
};

exports.login = function (username, password) {
  return User.findOne({ username: username, password: password })
      .then(foundUser => {
        return foundUser !== null;
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

function checkPassword(payload) {
  return payload.password === payload.passwordConfirm;
}

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
      this.getUser(username).then(foundUser => {
        return ImagesController.removeImage(foundUser.image);
      }).then(deleted => {
        return ImagesController.saveImage(image.path, image.headers['content-type']);
      }).then(image => {
        imageChange(username, displayname, email, description, image.id);
      }).catch(err => {
        throw err;
      });
    } else {
      simpleChange(username, displayname, email, description);
    }
  } else {
    this.getUser(username).then(foundUser => {
      if (foundUser.image) {
        ImagesController.removeImage(foundUser.image);
      }

      imageChange(username, displayname, email, description, null);
    });
  }
};

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
