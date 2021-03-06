'use strict';

const UserController = require('../controller/users');
const jwt = require('jsonwebtoken');

exports.createToken = function (user) {
  const payload = {
    id: user._id,
    username: user.username,
    isAdmin: user.isAdmin || false,
  };

  const options = {
    algorithm: 'HS256',
    expiresIn: '12h',
  };

  return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secretjwtpasswordnotrevealedtoanyone',
      options
  );
};

exports.decodeToken = function (token) {
  const userInfo = {};
  try {
    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'secretjwtpasswordnotrevealedtoanyone'
    );
    userInfo.userId = decoded.id;
    userInfo.username = decoded.username;
    userInfo.isAdmin = decoded.isAdmin;
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
