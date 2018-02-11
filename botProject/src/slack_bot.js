require('dotenv').config();

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const tutor = require('./tutor');
const dialogs = require('./dialog');
const prompts = require('./prompt');
const debug = require('debug')('slash-command-template:index');
const app = express();

/*
 * Parse application/x-www-form-urlencoded && application/json
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

if (!process.env.BOT_TOKEN) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}
/*

var Botkit = require('./lib/Botkit.js');
var os = require('os');

var controller = Botkit.slackbot({
    debug: true,
});
*/

var Botkit = require('botkit');
var mongoStorage = require('botkit-storage-mongo')({mongoUri: 'mongodb://seprojuser:seprojuser123@ds123728.mlab.com:23728/wolftutor', tables: ['user','tutor','subject']});
var os = require('os');

var controller = Botkit.slackbot({
    storage: mongoStorage,
});

var bot = controller.spawn({
    token: process.env.BOT_TOKEN
}).startRTM();

controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });


    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!!');
        } else {
            bot.reply(message, 'Hello.');
        }
    });
});

controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user, function(err, id) {
            bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});


controller.hears(['find','need a tutor', 'find a tutor', 'want a tutor', 'select a tutor' ],
    'direct_message,direct_mention,mention', function(bot, message) {

        controller.storage.user.all(function(err,users) {
            console.log(users)
            if (err) {
                throw new Error(err);
            }
        });

        bot.startConversation(message,function(err,convo) {
            var subs="";
            controller.storage.subjects.all(function(error, subjects){
                for(var s in subjects)
                    console.log(s);
            });
        });
    });

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}

controller.hears('become a tutor', 'direct_message', function(bot, message) {
    bot.reply(message, prompts.become_tutor_prompt);
});

app.get('/', (req, res) => {
  res.send('<h2>The Slash Command and Dialog app is running</h2> <p>Follow the' +
  ' instructions in the README to configure the Slack App and your environment variables.</p>');
});

app.post('/message', (req, res) => {
  var payload = JSON.parse(req.body.payload);
  var callbackId = payload.callback_id;
  const token = payload.token;
  const trigger_id = payload.trigger_id;
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {

    if(callbackId=='become_tutor_prompt'){
      var checkValue = payload.actions[0].value;
      if (checkValue == 'no') {
        axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
          token: process.env.SLACK_ACCESS_TOKEN,
          channel: payload.channel.id,
          // Edit the text that you want to send to the bot
          text: 'OK',
        })).then((result) => {
          debug('sendConfirmation: %o', result.data);
        }).catch((err) => {
          debug('sendConfirmation error: %o', err);
          console.error(err);
        });
      }
      else {
          // Yes on become a tutor prompt
          const dialog = {
          token: process.env.SLACK_ACCESS_TOKEN,
          trigger_id,
          dialog: JSON.stringify(dialogs.submit_tutor_info_dialog),
        };

        // open the dialog by calling dialogs.open method and sending the payload
        axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog))
          .then((result) => {
            debug('dialog.open: %o', result.data);
            console.log("Dialog Opened sucessful");
            res.send('');
          }).catch((err) => {
            debug('dialog.open call failed: %o', err);
            res.sendStatus(500);
          });
        } // End of Else
      } // End of If

    else if(callbackId=='submit_tutor_info'){
      // immediately respond with a empty 200 response to let
      // Slack know the command was received
      res.send('');
      axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
        token: process.env.SLACK_ACCESS_TOKEN,
        channel: payload.channel.id,
        // Edit the text that you want to send to the bot
        //text: 'OK',
        attachments:JSON.stringify(prompts.add_more_subjects_prompt),
      })).then((result) => {
        debug('sendConfirmation: %o', result.data);
      }).catch((err) => {
        debug('sendConfirmation error: %o', err);
        console.error(err);
      });
      // create tutor
      tutor.create(payload.user.id, payload.submission);
    } // End of else if for submit tutor info
    else if (callback_id ='tutor_add_subjects') {
      var checkValue = payload.actions[0].value;
      if (checkValue == 'no') {
        // Get the availibility Prompt
        axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
          token: process.env.SLACK_ACCESS_TOKEN,
          channel: payload.channel.id,
          // Edit the text that you want to send to the bot
          //text: 'OK',
          attachments:JSON.stringify(prompts.add_availability_prompt),
        })).then((result) => {
          debug('sendConfirmation: %o', result.data);
        }).catch((err) => {
          debug('sendConfirmation error: %o', err);
          console.error(err);
        });
      } else {
        // Dialog for Adding a subject
        const dialog = {
        token: process.env.SLACK_ACCESS_TOKEN,
        trigger_id,
        dialog: JSON.stringify(dialogs.add_more_subjects_dialog),
      };

      // open the dialog by calling dialogs.open method and sending the payload
      axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog))
        .then((result) => {
          debug('dialog.open: %o', result.data);
          console.log("Dialog Opened sucessful");
          res.send('');
        }).catch((err) => {
          debug('dialog.open call failed: %o', err);
          res.sendStatus(500);
        });
      } // End of else for add more subjects
    } // End of else if for tutor add subjects

  } else {
    debug('Verification token mismatch');
    console.log('Failed Here');
    res.sendStatus(403);
  }
});

app.post('/botactivity', (req, res) => {
  console.log(req['body']['event']['text']);
  // Will need to verify the challenge parameter first
  res.send("I am here");
  //console.log(req['body']['event']['text']);
  //res.send("I am here");
  const query = req.body.event.text;
  console.log(query);
  if(query.match(/become a tutor/i)) {
    console.log('Yes He wants to bocome a Tutor');
  }
  else {
    console.log('No ');
  }
  console.log(req['body']);
  res.send(req.body.challenge);
  // console.log(req);
  // res.send('');
});


app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}!`);
});
