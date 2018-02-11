/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

This bot demonstrates many of the core features of Botkit:

* Connect to Slack using the real time API
* Receive messages based on "spoken" patterns
* Reply to messages
* Use the conversation system to ask questions
* Use the built in storage system to store and retrieve information
  for a user.

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    token=<MY TOKEN> node slack_bot.js

# USE THE BOT:

  Find your bot inside Slack to send it a direct message.

  Say: "Hello"

  The bot will reply "Hello!"

  Say: "who are you?"

  The bot will tell you its name, where it is running, and for how long.

  Say: "Call me <nickname>"

  Tell the bot your nickname. Now you are friends.

  Say: "who am I?"

  The bot will tell you your nickname, if it knows one for you.

  Say: "shutdown"

  The bot will ask if you are sure, and then shut itself down.

  Make sure to invite your bot into other channels using /invite @<my bot>!

# EXTEND THE BOT:

  Botkit has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


if (!process.env.token) {
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
    token: process.env.token
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

controller.hears(['what is my name', 'who am i'], 'direct_message,direct_mention,mention', function(bot, message) {

    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Your name is ' + user.name);
        } else {
            bot.startConversation(message, function(err, convo) {
                if (!err) {
                    convo.say('I do not know your name yet!');
                    convo.ask('What should I call you?', function(response, convo) {
                        convo.ask('You want me to call you `' + response.text + '`?', [
                            {
                                pattern: 'yes',
                                callback: function(response, convo) {
                                    // since no further messages are queued after this,
                                    // the conversation will end naturally with status == 'completed'
                                    convo.next();
                                }
                            },
                            {
                                pattern: 'no',
                                callback: function(response, convo) {
                                    // stop the conversation. this will cause it to end with status == 'stopped'
                                    convo.stop();
                                }
                            },
                            {
                                default: true,
                                callback: function(response, convo) {
                                    convo.repeat();
                                    convo.next();
                                }
                            }
                        ]);

                        convo.next();

                    }, {'key': 'nickname'}); // store the results in a field called nickname

                    convo.on('end', function(convo) {
                        if (convo.status == 'completed') {
                            bot.reply(message, 'OK! I will update my dossier...');

                            controller.storage.users.get(message.user, function(err, user) {
                                if (!user) {
                                    user = {
                                        id: message.user,
                                    };
                                }
                                user.name = convo.extractResponse('nickname');
                                controller.storage.users.save(user, function(err, id) {
                                    bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
                                });
                            });



                        } else {
                            // this happens if the conversation ended prematurely for some reason
                            bot.reply(message, 'OK, nevermind!');
                        }
                    });
                }
            });
        }
    });
});


controller.hears(['shutdown'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.startConversation(message, function(err, convo) {

        convo.ask('Are you sure you want me to shutdown?', [
            {
                pattern: bot.utterances.yes,
                callback: function(response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function() {
                        process.exit();
                    }, 3000);
                }
            },
        {
            pattern: bot.utterances.no,
            default: true,
            callback: function(response, convo) {
                convo.say('*Phew!*');
                convo.next();
            }
        }
        ]);
    });
});


controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', function(bot, message) {

        var hostname = os.hostname();
        var uptime = formatUptime(process.uptime());

        bot.reply(message,
            ':robot_face: I am a bot named <@' + bot.identity.name +
             '>. I have been running for ' + uptime + ' on ' + hostname + '.');

    });

controller.hears(['find','need a tutor', 'find a tutor', 'want a tutor', 'select a tutor' ],
    'direct_message,direct_mention,mention', function(bot, message) {

            //TODO put in a method
            var sub_list = '';
            controller.storage.subject.all(function(err,subjects) {
                //console.log(subjects);
                //Commenting old plain text logic of subjects
                for(var temp in subjects) {
                    sub_list = sub_list + subjects[temp].name.toString() + '\n ';
                }
                    //TODO- how to handle the error-string statement?
                  if (err) {
                      throw new Error(err);
                  }

                var subjects_display_list = 'Choose one of the subjects :-' +'\n' +sub_list;
                //for(var sub in subjects) {
                    var reply_with_attachments = {
                        'attachments': [
                            {
                                fields: [
                                    {
                                        value: subjects_display_list,//subjects[sub].name,
                                        short:true,
                                    },]

                            }
                        ],
                    }

                   // bot.reply(message, reply_with_attachments);
                //}

                //console.log(subjects_display_list);
               // bot.reply(message, subjects_display_list);
                bot.startConversation(message,function(err,convo) {

                    convo.addQuestion(reply_with_attachments,function(response,convo) {
                      //  console.log(response.text);


                        //convo.say was not working
                        isValidSubject(response.text,function(flag){
                            if(flag == true)
                                bot.reply(convo.source_message, 'Cool, you selected: ' + response.text);
                            else {
                                bot.reply(convo.source_message, 'Please select a valid subject.');
                                convo.repeat();
                            }
                        });

                        //TODO this method directly prints the list of tutors, TODO get name based on user id
                        //getTutorsForSubject(response.text);

                        //console.log(tutorList);
                        convo.next();
                    },{},'default');
                    //});
                });

            });

    });

//Added test method- to be removed.
controller.hears(['question me'], 'message_received', function(bot,message) {

    // start a conversation to handle this response.
    bot.startConversation(message,function(err,convo) {
        console.log('blah');
        convo.addQuestion('How are you?',function(response,convo) {

            bot.reply('Cool, you said: ' + response.text);
            convo.next();

        },{},'default');

    })

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

function getTutorsForSubject(subject){
    //TODO //if subject is not one of the subjects in the table, throw exception

    var tutorList=new Array();

    controller.storage.tutor.all(function(err,tutors){
        //console.log('The chosen subject is '+subject);
        for(var i in tutors) {
            //console.log(tutors[i]);
            var tsubjects=tutors[i].subjects;
            //console.log(tsubjects);
            for(var j in tsubjects){
                //console.log(tsubjects[j].name);
                if(tsubjects[j].name.toLowerCase()==subject.toLowerCase()) {

                    console.log(tutors[i]);
                   // tutorList.push(tutors[i]);
                }
            }
        }
    });
//    return tutorList;
}
function isValidSubject(mysubject,callback){
    var flag = false;
    controller.storage.subject.find({name: { $regex : new RegExp(mysubject.toString(), "i") }/*subject.toString()*/},
        function(error, subject){
        if(error){
            //return false;
        }
        if(mysubject.toString().toLowerCase()==subject[0].name.toLowerCase()) {
            console.log('valid subject');
            flag = true;
        }

            callback(flag);
    });

}