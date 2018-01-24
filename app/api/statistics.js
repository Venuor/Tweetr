'use strict';

const UserController = require('../controller/users');
const TweetController = require('../controller/tweets');

exports.getGlobal = {
  auth: false,
  handler: function (request, reply) {
    const result = {};
    let userError = false;
    let tweetError = false;

    UserController.getAll()
        .then(users => {
          result.users = users.length;
          completed();
        })
        .catch(error => {
          console.log(error);
          userError = true;
          completed();
        });

    TweetController.getAllTweets()
        .then(tweets => {
          result.tweets = tweets.length;
          result.imageTweets = 0;
          result.characters = 0;

          for (let tweet of tweets) {
            result.imageTweets += tweet.image ? 1 : 0;
            result.characters += tweet.text.length;
          }

          result.tweetsDone = true;

          completed();
        }).catch(error => {
          console.log(error);
          tweetError = true;
          completed();
        });

    function completed() {
      if (result.users >= 0 && result.tweetsDone) {
        delete result.tweetsDone;

        reply(result).code(200);
      } else if (userError || tweetError) {
        reply(Boom.badImplementation('Internal Error'));
      }
    }
  },
};
