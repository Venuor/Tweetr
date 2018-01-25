'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

let dbURI = 'mongodb://192.168.0.108/tweetr';
if (process.env.NODE_ENV === 'production') {
  dbURI = process.env.MONGOLAB_URI;
}

mongoose.connect(dbURI);

mongoose.connection.on('connected', function () {
  console.log('Mongoose connected to ' + dbURI);

  if (process.env.NODE_ENV !== 'production') {
    // This will not work for whatever reasons
    const seeder = require('mongoose-seeder');
    const data = require('./initdata.json');
    const User = require('./user');
    const Tweet = require('./tweet');
    const Image = require('./image');
    seeder.seed(data, { dropDatabase: false, dropCollections: true })
        .then(dbData => {
          console.log('preloading test data');
          console.log(dbData);
        }).catch(err => {
      console.log(err);
    });
  }
});

mongoose.connection.on('error', function (err) {
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
  console.log('Mongoose disconnected');
});
