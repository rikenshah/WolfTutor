require('dotenv').config();

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

const UserModel = require('./model/user');

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
  },
  send_tutor_notification(user_id, tutor_id, date, day, from, to){
  // send_tutor_notification(){
    // var student_name = "Rikne";
    // var student_phone = "1919191991";
    // var student_email = "rshah9@ncsu.edu";
    // var tutor_id = "U93ELGP8S"
    // var user_id = "U8XDVJD26";
    // var from = "csdcd";
    // var to = "cdscds";
    // var date = "Cdcdsdc";
    // var day = "cdcdsd";
    UserModel.get_user_info(user_id, function(user){
      console.log(user);
      var student_name = user.name;
      var student_email = user.email;
      var student_phone = user.phone;
      module.exports.send_message(tutor_id,"Hello There",[
              {
                  "fields":
                  [
                   {
                      "title": 'Student Name',
                      "value": student_name,
                      "short":true,
                    },
                    {
                      "title": 'Email',
                      "value": student_email,
                      "short":true,
                    },
                    {
                      "title": 'Phone',
                      "value": student_phone,
                      "short":true,
                    },
                    {
                      "title": 'Date',
                      "value": date,
                      "short":true,
                    },
                    {
                      "title": 'Day',
                      "value": day,
                      "short":true,
                    },
                    {
                      "title": 'From',
                      "value": from,
                      "short":true,
                    },
                    {
                      "title": 'To',
                      "value": to,
                      "short":true,
                    }
                  ]
              }
          ]);
    }); // End of query
  }// End of function
}//end of module
