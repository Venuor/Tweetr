'use strict';

const Users = require('./app/api/users');

module.exports = [

  { method: 'GET', path: '/api/user/{username}', config: Users.findUser },

];
