'use strict';

const mongoose = require('mongoose');
const Tweet = require('./tweet');

const userSchema = mongoose.Schema({
  username:       { type: String, required: true, unique: true },
  displayname:    { type: String, required: true },
  email:          { type: String, required: true, unique: true },
  password:       { type: String, required: true },
  joined:         { type: Date,   required: true, default: Date.now },
  image:          { type: mongoose.Schema.ObjectId, ref: 'Image' },
  description:    { type: String, default: '' },
  subscribers:    { type: [String], default: [] },
  subscriptions: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  isAdmin:        { type: Boolean, default: false },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
