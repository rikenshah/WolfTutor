require('dotenv').config();

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const tutor = require('./module/tutor');
const subject = require('./module/subject');
const tutorSlot = require('./module/tutor_slot');
const dialogs = require('./module/dialog.js');
const prompts = require('./module/prompt.js');
const action = require('./module/action');
const debug = require('debug')('slash-command-template:index');
const app = express();
const UserModel = require('./model/user');
const TutorModel = require('./model/tutor');
const ReservationModel = require('./model/reservation');
const SubjectModel = require('./model/subject');
const message_handler =  require('./module/message_handler');

const tutorRanking = require('./module/recommendation_algorithm.js');

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());

if (!process.env.BOT_TOKEN) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

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

controller.hears(
    ['reservations history', 'history'], 
    'direct_message,direct_mention,mention', 
    function (bot, message){
        bot.startConversation(message, function (err, convo) {
            bot.api.users.info({user: message.user}, (error, response) => {
                let {id, name, real_name} = response.user;
                var hasReservationTutee=false;
                var hasReservationTutor=false;
                var loggedInUserId = id;//'U84DXQKPL';//id;//U84DXQKPL

                controller.storage.reservation.find({tutorid: loggedInUserId, active: 'no'}, function (error,reservations) {

                    if (reservations != null && reservations.length>0) {
                        hasReservationTutor=true;
                        for (var r in reservations) {
                            bot.reply(message,
                                      {
                                          attachments:
                                          [
                                              {
                                                  fields:
                                                  [
                                                      {
                                                          title: 'Date',
                                                          value: reservations[r].date,
                                                          short: true,
                                                      },
                                                      {
                                                          title: 'Day',
                                                          value: reservations[r].day,
                                                          short: true,
                                                      },
                                                      {
                                                          title: 'Start time',
                                                          value: reservations[r].from,
                                                          short: true,
                                                      },
                                                      {
                                                          title: 'End time',
                                                          value: reservations[r].to,
                                                          short: true,
                                                      }
                                                  ]
                                              }
                                          ]
                                      }
                                     );
                        }

                    }
                    //Here are your history as a tutee.
                    controller.storage.reservation.find({userid: loggedInUserId, active: 'no'}, function (error, reservations) {
                        if (reservations != null && reservations.length>0) {
                            console.log(reservations);
                            hasReservationTutee=true;

                            for (var r in reservations) {
                                bot.reply(message,
                                          {
                                              attachments:
                                              [
                                                  {
                                                      fields:
                                                      [
                                                          {
                                                              title: 'Date',
                                                              value: reservations[r].date,
                                                              short: true,
                                                          },
                                                          {
                                                              title: 'Day',
                                                              value: reservations[r].day,
                                                              short: true,
                                                          },
                                                          {
                                                              title: 'Start time',
                                                              value: reservations[r].from,
                                                              short: true,
                                                          },
                                                          {
                                                              title: 'End time',
                                                              value: reservations[r].to,
                                                              short: true,
                                                          }
                                                      ]
                                                  }
                                              ]
                                          }
                                         );
                            }
                        }
                        if(hasReservationTutee===false && hasReservationTutor===false)
                            bot.reply(message, 'No reservations history');
                    });
                });
            });
            convo.stop();
        });
    });


controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {
    bot.reply(message, 'Hello <@'+message.user+'>');
    bot.reply(message, "Welcome to WolfTutor, an on-campus peer-to-peer tutoring system. You can help your peers to understand difficult concepts and also get help dkjfdkfjdkf.");
    bot.reply(message, prompts.create_user_prompt);
});

//TODO show only active reservations, not the old ones
controller.hears(['My reservations'], 'direct_message,direct_mention,mention', function (bot, message)
                 {
                     bot.startConversation(message, function (err, convo) {

                         bot.api.users.info({user: message.user}, (error, response) => {
                             let {id, name, real_name} = response.user;
                             var hasReservationTutee=false;
                             var hasReservationTutor=false;
                             var loggedInUserId = id;//'U84DXQKPL';//id;//U84DXQKPL

                             controller.storage.reservation.find({tutorid: loggedInUserId, active: 'yes'}, function (error,reservations) {

                                 if (reservations != null && reservations.length>0) {
                                     hasReservationTutor=true;

                                     for (var r in reservations) {
                                         //if (reservations[r].tutorid === loggedInUserId || reservations[r].userid === loggedInUserId) {
                                         //controller.storage.tutor.find({user_id: reservations[r].tutorid}, function (error, users) {
                                         //      console.log(user_id, reservations[r].tutorid);
                                         // });
                                         bot.reply(message,
                                                   {
                                                       attachments:
                                                       [
                                                           {
                                                               fields:
                                                               [
                                                                   {
                                                                       title: 'Date',
                                                                       value: reservations[r].date,
                                                                       short: true,
                                                                   },
                                                                   {
                                                                       title: 'Day',
                                                                       value: reservations[r].day,
                                                                       short: true,
                                                                   },
                                                                   {
                                                                       title: 'Start time',
                                                                       value: reservations[r].from,
                                                                       short: true,
                                                                   },
                                                                   {
                                                                       title: 'End time',
                                                                       value: reservations[r].to,
                                                                       short: true,
                                                                   }
                                                               ]
                                                           }
                                                       ]
                                                   });
                                     }

                                 }
                                 //Here are your reservation as a tutee.
                                 controller.storage.reservation.find({userid: loggedInUserId, active: 'yes'}, function (error, reservations) {
                                     if (reservations != null && reservations.length>0) {
                                         console.log(reservations);
                                         hasReservationTutee=true;

                                         for (var r in reservations) {
                                             bot.reply(message,
                                                       {
                                                           attachments:
                                                           [
                                                               {
                                                                   fields:
                                                                   [
                                                                       {
                                                                           title: 'Date',
                                                                           value: reservations[r].date,
                                                                           short: true,
                                                                       },
                                                                       {
                                                                           title: 'Day',
                                                                           value: reservations[r].day,
                                                                           short: true,
                                                                       },
                                                                       {
                                                                           title: 'Start time',
                                                                           value: reservations[r].from,
                                                                           short: true,
                                                                       },
                                                                       {
                                                                           title: 'End time',
                                                                           value: reservations[r].to,
                                                                           short: true,
                                                                       }
                                                                   ]
                                                               }
                                                           ]
                                                       });
                                         }
                                     }
                                     if(hasReservationTutee===false && hasReservationTutor===false)
                                         bot.reply(message, 'No upcoming reservations');
                                 });

                                 //}
                             });
                         });
                         convo.stop();
                     });
                 });


//Method for a user to view rewards
controller.hears(['rewards','get my rewards','view my rewards','my points'], 'direct_message,direct_mention,mention', function (bot, message) {
    bot.startConversation(message, function (err, convo) {

        bot.api.users.info({user: message.user}, (error, response) => {
            let {id, name, real_name} = response.user;

            var loggedInUserId = id;//'U94AXQ6RL';//id;//

            controller.storage.user.find({user_id: loggedInUserId}, function (error, users) {
                if (users != null && users.length > 0) {
                    //update the user rewards
                    bot.reply(message, 'Your Reward points are ' + users[0].points);
                    bot.reply(message, 'Keep tutoring to earn more points. #GoPack');

                }
                else
                    bot.reply(message,'You are not enrolled into the system! Enter Hi to enroll yourself');
                convo.stop();
            });
        });

    });
});

//Method for a user to view availibility
controller.hears(['my availability','availability', 'view my availability'], 'direct_message,direct_mention,mention', function (bot, message) {

    bot.startConversation(message, function (err, convo) {

        console.log('availability start');
        bot.api.users.info({user: message.user}, (error, response) => {
            let {id, name, real_name} = response.user;

            var loggedInUserId = id;//

            var day = '';
            var from = '';
            var to = '';
            var flag = 0;

            controller.storage.tutor.find({user_id: loggedInUserId}, function (error, tutors) {
                if (tutors != null && tutors.length > 0) {

                    console.log(tutors[0].availability);
                    if(tutors[0].availability.length != 0)
                    {
                        for(var i in tutors[0].availability)
                        {
                            flag = 1;
                            day += tutors[0].availability[i].day + "\t"+ tutors[0].availability[i].from + "\t"+tutors[0].availability[i].to + "\n";
                            from += tutors[0].availability[i].from +"\n";
                            to += tutors[0].availability[i].to + "\n";
                        }
                        console.log(day, from, to);
                        bot.reply(message, "Your availability are:\n"+day);
                    }

                }
                if(flag == 0)
                {
                    bot.reply(message, "Sorry, you haven't entered any availability");
                }
                convo.stop();
            });
        });
        console.log('availability end');
    });
});

//Method for a user to view subjects
controller.hears(['my subject','subject', 'view my subject'], 'direct_message,direct_mention,mention', function (bot, message) {

    bot.startConversation(message, function (err, convo) {

        bot.api.users.info({user: message.user}, (error, response) => {
            let {id, name, real_name} = response.user;

            var loggedInUserId = id;

            var user_subjects = '';
            var flag = 0;

            controller.storage.tutor.find({user_id: loggedInUserId}, function (error, tutors) {
                if (tutors != null && tutors.length > 0) {

                    console.log(tutors[0].subjects);
                    if(tutors[0].subjects.length != 0)
                    {
                        for(var i in tutors[0].subjects)
                        {
                            flag = 1;
                            user_subjects += tutors[0].subjects[i].name + "\n";
                        }

                        console.log(user_subjects);
                        bot.reply(message, "Your subjects are:\n"+user_subjects);
                    }

                }
                if(flag == 0)
                {
                    bot.reply(message, "Sorry, you haven't entered any subjects");
                }
                convo.stop();
            });
        });

    });
});

controller.hears(['what can I do'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.reply(message, "You can enroll as a tutor by saying I want to be a tutor or become a tutor \nYou can find a tutor by saying find a tutor or I want a tutor." );
});

controller.hears(['find', 'need a tutor', 'find a tutor', 'want a tutor', 'select a tutor'], 'direct_message,direct_mention,mention', function (bot, message) {
    var sub_list = '';
    controller.storage.subject.all(function (err, subjects) {

        for (var temp in subjects) {
            sub_list = sub_list + subjects[temp].name.toString() + '\n ';
        }
        //TODO- how to handle the error-string statement?
        if (err) {
            throw new Error(err);
        }

        var subjects_display_list = 'Choose one of the subjects :-' + '\n' + sub_list+'\n'+'Enter exit to go back!';


        bot.startConversation(message, function (err, convo) {
            bot.api.users.info({user: message.user}, (error, response) => {
                let {id, name, real_name} = response.user;
                console.log(id, name, real_name);

                var slackUserName = id;//'U84DXQKPL';//id;
                convo.addQuestion(prompts.SubjectList(subjects_display_list), function (response, convo) {
                    //  console.log(response.text);
                    if(response.text.toLowerCase()==='exit') {
                        bot.reply(message,'Cool, you are out finding a tutor!');
                        convo.stop();
                        return;
                    }
                    //convo.say was not working
                    subject.isValidSubject(response.text, function (flag) {
                        if (flag == true) {
                            bot.reply(convo.source_message, 'Cool, you selected: ' + response.text);
                            tutor.getTutorsForSubject(response.text,slackUserName ,function (json_file) {

                                var count = 0;
                                for (var i in json_file) {
                                    count = count + 1;
                                }
                                // console.log("Json file length");
                                // console.log(count);
                                console.log(message);
                                console.log(json_file);


                                if (count == 0) {
                                    bot.reply(message, "Sorry! There are no tutor currently available for this course.\n Try to find a tutor again");
                                }
                                else
                                {

                                    controller.storage.user.find({user_id: message.user}, function (error, users) {
                                        let user = {};
                                        if (users != null && users.length > 0) {
                                            user = users[0];
                                        }

                                        bot.reply(convo.source_message, 'What do you want to prioritize when matching with a tutor?' );
                                        convo.addQuestion(prompts.SelectDesiredAttribute, function (response, convo) {

                                            let confirmationStart = 'Cool, you selected ';
                                            let confirmationEnd = ' I will work on maximizing that when matching you with a tutor';
                                            let invalid = 'No problem, I\'ll just use the defaults.';

                                            let options = null;
                                            switch(response.text.toLowerCase()){
                                            case 'gpa':
                                                bot.reply(convo.source_message, confirmationStart + 'GPA' + confirmationEnd);
                                                options = {
                                                    gpa: 10
                                                };
                                                break;
                                            case 'experience':
                                                bot.reply(convo.source_message, confirmationStart + 'tutor experience' + confirmationEnd);
                                                options = {
                                                    individual: 10
                                                };
                                                break;
                                            case 'none':
                                                bot.reply(convo.source_message, invalid);
                                            default:
                                                bot.reply(convo.source_message, 'I didn\'t recognize that. ' + invalid);
                                                break;
                                            }
                                            convo.stop();
                                            json_file = tutorRanking.Prioritize(json_file, user, options);

                                            for (var i in json_file)
                                            {
                                                bot.reply(message, prompts.Tutor_Display_Info(json_file[i]));
                                            }

                                        });
                                    });
                                }
                            });
                        }
                        else {
                            bot.reply(convo.source_message, 'Please select a valid subject.');
                            convo.repeat();
                        }
                    });

                    convo.next();
                }, {}, 'default');
                //});
            });
        });
    });
});


controller.hears('become a tutor', 'direct_message', function(bot, message) {
    bot.reply(message, prompts.become_tutor_prompt);
});

var session_over = ['session a over','rate the tutor','add review','review']
controller.hears('review', 'direct_message', function(bot, message) {
    bot.reply(message, prompts.add_review_prompt);
});

controller.hears('redeem', 'direct_message', function(bot, message) {
    bot.reply(message, '1) Get $15 Giftcard of wolfoutfitter for 300 points\n 2) Get $30 Giftcard of wolfoutfitter 500 points \n 3) Get $60 Giftcard of wolfoutfitter 1000 points \n Contact wolftutor@gmail.com for getting your giftcard');
});

controller.hears(['buy', 'buy points'], 'direct_message', function(bot, message) {
    bot.reply(message, '1) Get 200 points for $25\n 2) Get 500 points for $40 \n 3) Get 1000 points for $80 \n Contact wolftutor@gmail.com for buying points');
});

app.get('/', (req, res) => {
    res.send('<h2>Welcome to Wolf Tutor</h2> <p>Follow the' +
             ' instructions in the README to configure the Slack App and your environment variables.</p>');
});

app.post('/message', (req, res) =>
         {
             message_handler.handle(req, res);
         });

app.listen(process.env.PORT, () => {
    console.log(`App listening on port ${process.env.PORT}!`);
});
