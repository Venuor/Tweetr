'use strict';

const assert = require('chai').assert;
const request = require('sync-request');

const loginEndpoint = 'http://localhost:4000/api/login';
const userEndpoint  = 'http://localhost:4000/api/user';
const usersEndpoint = 'http://localhost:4000/api/users';

const user = {
  username: 'test',
  displayname: 'Mr. Test',
  password: 'password',
  passwordConfirm: 'password',
  email: 'test@example.com',
};

const login =  {
  username: user.username,
  password: user.password,
};

suite('Users API tests', () => {

  test('POST /user', () => {
    const res = request('POST', userEndpoint, { json: user });

    const newUser = JSON.parse(res.getBody());

    assert.equal(newUser.username, user.username);
    assert.equal(newUser.displayname, user.displayname);
    assert.equal(newUser.email, user.email);
    assert.lengthOf(newUser.description, 0);
    assert.lengthOf(newUser.subscribers, 0);
    assert.isFalse(newUser.isAdmin);
    assert.equal(newUser.image, '/images/placeholder.png');
    assert.lengthOf(newUser.subscriptions, 0);
  });

  test('POST /login', () => {
    const res = request('POST', loginEndpoint, { json: login });
    const response = JSON.parse(res.getBody());

    assert.isTrue(response.success);
    assert.isNotEmpty(response.token);
  });

  test('GET /user', () => {
    const token = getLoginToken(login);
    const res = request('GET', userEndpoint, { headers: { Authorization: token } });
    const response = JSON.parse(res.getBody());

    assert.equal(response.username, user.username);
    assert.equal(response.displayname, user.displayname);
    assert.equal(response.email, user.email);
    assert.lengthOf(response.description, 0);
    assert.lengthOf(response.subscribers, 0);
    assert.isFalse(response.isAdmin);
    assert.equal(response.image, '/images/placeholder.png');
    assert.lengthOf(response.subscriptions, 0);
  });

  test('GET /user/{username}', () => {
    const res = request('GET', userEndpoint + '/' + user.username);
    const response = JSON.parse(res.getBody());

    assert.equal(response.username, user.username);
    assert.equal(response.displayname, user.displayname);
    assert.equal(response.email, user.email);
    assert.lengthOf(response.description, 0);
    assert.lengthOf(response.subscribers, 0);
    assert.isFalse(response.isAdmin);
    assert.equal(response.image, '/images/placeholder.png');
    assert.lengthOf(response.subscriptions, 0);
  });

  test('POST /user/{username}/subscribe', () => {
    const token = getLoginToken(login);
    const res = request(
        'POST',
        userEndpoint + '/admin/subscribe',
        { headers: { Authorization: token } }
    );

    assert.equal(res.statusCode, 204);

    const adminRes = request('GET', userEndpoint + '/admin');
    const adminResponse = JSON.parse(adminRes.getBody());

    assert.lengthOf(adminResponse.subscribers, 3);
    assert.isTrue(adminResponse.subscribers.includes('test'));
    assert.isTrue(adminResponse.subscribers.includes('user'));
    assert.isTrue(adminResponse.subscribers.includes('venour'));
  });

  test('POST /user/{username}/unsubscribe', () => {
    const token = getLoginToken(login);
    const res = request(
        'POST',
        userEndpoint + '/admin/unsubscribe',
        { headers: { Authorization: token } }
    );

    assert.equal(res.statusCode, 204);

    const adminRes = request('GET', userEndpoint + '/admin');
    const adminResponse = JSON.parse(adminRes.getBody());

    assert.lengthOf(adminResponse.subscribers, 2);
    assert.isTrue(adminResponse.subscribers.includes('venour'));
    assert.isTrue(adminResponse.subscribers.includes('user'));
  });

  test('POST /user/{username}/password', () => {
    const token = getLoginToken(login);
    const password = { password: '12345678', passwordConfirm: '12345678' };
    const res = request(
        'POST',
        userEndpoint + '/' + user.username + '/password',
        { headers: { Authorization: token }, json: password }
    );

    assert.equal(res.statusCode, 204);

    const checkToken = getLoginToken({ username: login.username, password: '12345678' });
    assert.isNotEmpty(checkToken);
  });

  test('DELETE /users', () => {
    const token = getLoginToken({ username: 'admin', password: 'password' });
    const res = request(
        'DELETE',
        usersEndpoint + '?users=' + user.username,
        { headers: { Authorization: token } },
    );
    assert.equal(res.statusCode, 204);

    const userRes = request('GET', userEndpoint + '/' + user.username);
    assert.equal(userRes.statusCode, 404);
  });

  test('GET /users', () => {
    const res = request('GET', usersEndpoint);
    const response = JSON.parse(res.getBody());

    assert.equal(response.length, 3);
  });

});

function getLoginToken(credentials) {
  const res = request('POST', loginEndpoint, { json: credentials });
  return JSON.parse(res.getBody()).token;
}
