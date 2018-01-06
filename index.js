'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: process.env.PORT || 4000 });

require('./app/model/db');

server.register([require('inert'), require('vision'), require('hapi-auth-cookie')], err => {
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
    isCached: false,
  });

  server.auth.strategy('standard', 'cookie', {
    password: 'secretpasswordnotrevealedtoanyone',
    cookie: 'tweetr-cookie',
    isSecure: false,
    ttl: 24 * 60 * 60 * 1000,
  });

  server.auth.default({
    strategy: 'standard',
  });

  server.route(require('./routes'));

  server.start(err => {
    if (err) {
      throw err;
    }

    console.log('Server listening at:', server.info.uri);
  });
});
