# Tweetr

Tweetr is a small Twitter copycat application and was created as project submission for the course 
Modern Web Applications and Services by [Eamonn de Leastar](https://github.com/edeleastar).

Users can sign up or login into Tweetr and immediately start writing tweets limited to
140 characters. 

The app features a global feed listing all Tweets of all users chronologically. Users can also
follow each other to view their Tweets on a personal feed. This feed only displays the Tweets of 
users you are subscribed to.

There also exists an admin user which can delete any user and Tweet.

The application is currently hosted on [Heroku](https://venour-tweetr.herokuapp.com/).

## Setup

The Tweetr application is build on node.js, to install all dependencies you will need to call:
```
yarn install
```

### Environment variables

Some functions of the application can be configured using environment variables:

| Variable        | Function |
| --------------- | -------- |
| `NODE_ENV`      | `production` or `dev` |
| `PORT `         | the port the application should be bound to (default 4000) |
| `COOKIE_SECRET` | a passphrase used for cookies (defaults to hardcoded variant; should be set) |
| `JWT_SECRET`    | a passphrase used for JWT (defaults to hardcoded variant; should be set) |
| `MONGOLAB_URI`  | a MongoDB connection uri (e.g.: `mongodb://mongo`) |