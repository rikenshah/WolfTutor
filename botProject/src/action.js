const axios = require('axios');
const debug = require('debug')('botProject:src/slack_bot');
const qs = require('querystring');

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
      token: process.env.SLACK_ACCESS_TOKEN,
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
}
