'use strict';

const assert = require('chai').assert;
const request = require('sync-request');

suite('Statistics API tests', () => {

  test('GET /statistics/global', () => {
    const url = 'http://localhost:4000/api/statistics/global';
    const res = request('GET', url);
    const stats = JSON.parse(res.getBody('utf8'));

    assert.equal(stats.users, 3);
    assert.equal(stats.tweets, 3);
    assert.equal(stats.imageTweets, 0);
    assert.equal(stats.characters, 67);
  });

  test('GET /statistics/users', () => {
    const url = 'http://localhost:4000/api/statistics/users?users=admin';
    const res = request('GET', url);
    const stats = JSON.parse(res.getBody('utf8'));

    assert.equal(stats.users, 1);
    assert.equal(stats.tweets, 1);
    assert.equal(stats.imageTweets, 0);
    assert.equal(stats.characters, 25);
  });

});
