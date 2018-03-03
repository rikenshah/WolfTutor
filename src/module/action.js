require('dotenv').config();
const configure = require('../model/config');

const axios = require('axios');
const debug = require('debug')('botProject:src/slack_bot');
const qs = require('querystring');

var Botkit = require('botkit');

var mongoStorage = require('botkit-storage-mongo')({
    mongoUri: process.env.MONGO_CONNECTION_STRING,
    tables: ['user', 'tutor', 'subject', 'reservation']
});
var os = require('os');

var controller = Botkit.slackbot({
    storage: mongoStorage,
});

var bot = controller.spawn({
    token: process.env.BOT_TOKEN
}).startRTM();


module.exports = {
  open_dialog: function(dialog,res) {
    axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog))
    .then((result) => {
      debug('dialog.open: %o', result.data);
      console.log("Dialog Opened sucessful");
      res.send('');
    }).catch((err) => {
      debug('dialog.open call failed: %o', err);
      res.sendStatus(500);
    });
  },

  send_message: function(channel_id,text,attachments){
    axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
      token: process.env.BOT_TOKEN,
      channel: channel_id,
      // Edit the text that you want to send to the bot
      text: text,
      attachments : JSON.stringify(attachments),
    })).then((result) => {
      debug('sendConfirmation: %o', result.data);
    }).catch((err) => {
      debug('sendConfirmation error: %o', err);
      console.error(err);
    });
  }
}//end of module
