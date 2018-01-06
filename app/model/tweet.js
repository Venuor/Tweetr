'use strict';

const mongoose = require('mongoose');

const tweetSchema = mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  text: String,
  date: { type: Date, default: Date.now },
});

const Tweet = mongoose.model('Tweet', tweetSchema);
module.exports = Tweet;
