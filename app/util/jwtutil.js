'use strict';

const UserController = require('../controller/users');
const jwt = require('jsonwebtoken');

exports.createToken = function (user) {
  const payload = {
    id: user._id,
    username: user.username,
  };

  const options = {
    algorithm: 'HS256',
    expiresIn: '1h',
  };

  return jwt.sign(payload, 'secretpasswordnotrevealedtoanyone', options);
};

exports.decodeToken = function (token) {
  const userInfo = {};
  try {
    const decoded = jwt.verify(token, 'secretpasswordnotrevealedtoanyone');
    userInfo.userId = decoded.id;
    userInfo.username = decoded.username;
  } catch (e) {
    throw e;
  }

  return userInfo;
};

exports.validate = function (decoded, request, callback) {
  UserController.getUser(decoded.username)
      .then(user => {
        if (user) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      }).catch(err => {
        callback(err, false);
      });
};
