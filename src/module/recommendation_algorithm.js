require('dotenv').config();
const axios = require('axios');
const debug = require('debug')('slash-command-template:tutor');
const qs = require('querystring');
const MongoClient = require('mongodb').MongoClient;
const UserModel = require('../model/user');
var mongoStorage = require('botkit-storage-mongo')({mongoUri: process.env.MONGO_CONNECTION_STRING, tables: ['user','tutor','subject']});
var Botkit = require('botkit');
var controller = Botkit.slackbot({
    storage: mongoStorage,
});

const find = (slackUserId) => {
  const body = { token: process.env.SLACK_ACCESS_TOKEN, user: slackUserId };
  const promise = axios.post('https://slack.com/api/users.info', qs.stringify(body));
  return promise;
};

function Prioritize(people) {

}

module.exports = { Prioritize };
