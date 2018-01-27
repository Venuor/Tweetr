'use strict';

const assert = require('chai').assert;
const request = require('sync-request');

const tweetEndpoint = 'http://localhost:4000/api/tweets';
const loginEndpoint = 'http://localhost:4000/api/login';

suite('Tweets API tests', () => {

  test('GET /tweets', () => {
    const res = request('GET', tweetEndpoint);
    const tweets = JSON.parse(res.getBody('utf8'));

    assert.equal(tweets.length, 3);
  });

  test('GET /tweets/{username}', () => {
    const res = request('GET', tweetEndpoint + '/admin');
    const tweets = JSON.parse(res.getBody('utf8'));

    assert.equal(tweets.length, 1);
    assert.equal(tweets[0].text, 'Lets make this thing big!');
    assert.equal(tweets[0].user.username, 'admin');
  });

  test('GET /tweets/{username}/timeline', () => {
    const login = {
      username: 'admin',
      password: 'password',
    };
    const token = getLoginToken(login);
    const res = request(
        'GET',
        tweetEndpoint + '/admin/timeline',
        { headers: { Authorization: token } }
    );

    assert.equal(JSON.parse(res.getBody()).length, 0);
  });

  test('DELETE /tweets (admin mode)', () => {
    const login = {
      username: 'admin',
      password: 'password',
    };
    const token = getLoginToken(login);
    const id = getTweetId('venour');

    const res = request(
        'DELETE',
        tweetEndpoint + '?tweets=' + id,
        { headers: { Authorization: token } }
    );

    assert.equal(res.statusCode, 204);
  });

  test('DELETE /tweets (normal mode)', () => {
    const login = {
      username: 'admin',
      password: 'password',
    };
    const token = getLoginToken(login);
    const id = getTweetId('admin');

    const res = request(
        'DELETE',
        tweetEndpoint + '?tweets=' + id,
        { headers: { Authorization: token } }
    );

    assert.equal(res.statusCode, 204);
  });

  test('DELETE /tweets/{username}', () => {
    const login = {
      username: 'user',
      password: 'password',
    };
    const token = getLoginToken(login);

    const tweetUrl = tweetEndpoint + '/' + login.username;
    const res = request('DELETE', tweetUrl, { headers: { Authorization: token } });

    assert.equal(res.statusCode, 204);
  });

});

function getLoginToken(credentials) {
  const res = request('POST', loginEndpoint, { json: credentials });
  return JSON.parse(res.getBody()).token;
}

function getTweetId(username) {
  let res = request('GET', tweetEndpoint +  '/' + username);
  return JSON.parse(res.getBody())[0].id;
}
