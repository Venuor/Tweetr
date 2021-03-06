'use strict';

require('./app/model/db');

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: process.env.PORT || 4000, routes: { cors: true } });

let isProduction = false;
if (process.env.NODE_ENV === 'production') {
  isProduction = true;
}

server.register([
    require('inert'),
    require('vision'),
    require('hapi-auth-cookie'),
    require('hapi-auth-jwt2'),
    ], err => {
  if (err) {
    throw err;
  }

  const Handlebars     = require('handlebars');
  const HandlebarsIntl = require('handlebars-intl');
  HandlebarsIntl.registerWith(Handlebars);

  server.views({
    engines: {
      hbs: Handlebars,
    },
    relativeTo: __dirname,
    path: './app/view',
    layoutPath: './app/view/layout',
    partialsPath: './app/view/partials',
    layout: true,
    isCached: isProduction,
  });

  server.auth.strategy('standard', 'cookie', {
    password: process.env.COOKIE_SECRET || 'secretcookiepasswordnotrevealedtoanyone',
    cookie: 'tweetr-cookie',
    isSecure: isProduction,
    redirectTo: '/login',
    ttl: 24 * 60 * 60 * 1000,
  });

  server.auth.strategy('jwt', 'jwt', {
    key: process.env.JWT_SECRET || 'secretjwtpasswordnotrevealedtoanyone',
    validateFunc: require('./app/util/jwtutil').validate,
    verifyOptions: { algorithms: ['HS256'] },
  });

  server.auth.default({
    strategy: 'standard',
  });

  server.route(require('./routes'));
  server.route(require('./routesapi'));

  server.start(err => {
    if (err) {
      throw err;
    }

    console.log('Server listening at:', server.info.uri);
  });
});
