'use strict';

const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username:       { type: String, required: true, unique: true },
  displayname:    { type: String, required: true, unique: true },
  email:          { type: String, required: true, unique: true },
  password:       { type: String, required: true },
  joined:         { type: Date,   required: true, default: Date.now },
  image:          { type: mongoose.Schema.ObjectId, ref: 'Image' },
  description:    { type: String, default: '' },
  subscribers:    { type: Number, default: 0 },
  subscriptions: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
});

const User = mongoose.model('User', userSchema);
module.exports = User;
