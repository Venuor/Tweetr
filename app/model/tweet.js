'use strict';

const mongoose = require('mongoose');

const tweetSchema = mongoose.Schema({
  user:  { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  text:  { type: String },
  date:  { type: Date, default: Date.now },
  image: { type: mongoose.Schema.ObjectId, ref: 'Image' },
});

const Tweet = mongoose.model('Tweet', tweetSchema);
module.exports = Tweet;
