'use strict';
import { suite } from 'mocha/lib/runner';

const assert = require('chai').assert;
const request = require('sync-request');

const url = 'http://localhost:4000/api/statistics';

suite('Statistics API tests', () => {

  test('GET /statistics/global', () => {
    const res = request('GET', url + '/global');
    const stats = JSON.parse(res.getBody('utf8'));

    assert.equal(stats.users, 3);
    assert.equal(stats.tweets, 3);
    assert.equal(stats.imageTweets, 0);
    assert.equal(stats.characters, 67);
  });

  test('GET /statistics/users', () => {
    const res = request('GET', url + '/users?users=admin');
    const stats = JSON.parse(res.getBody('utf8'));

    assert.equal(stats.users, 1);
    assert.equal(stats.tweets, 1);
    assert.equal(stats.imageTweets, 0);
    assert.equal(stats.characters, 25);
  });

  test('GET /statistics/graph/{username}', () => {
    const res = request('GET', url + '/graph/admin');
    const stats = JSON.parse(res.getBody('utf8'));

    assert.lengthOf(stats.links, 0);
    assert.lengthOf(stats.nodes, 1);
    assert.equal(stats.nodes[0].name, 'admin');
  });

});
