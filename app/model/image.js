'use strict';

const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
  data: { type: Buffer, required: true },
  type: { type: String, required: true },
});

const Image = mongoose.model('Image', imageSchema);
module.exports = Image;
