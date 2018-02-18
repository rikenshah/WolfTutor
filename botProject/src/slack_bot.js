require('dotenv').config();

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const tutor = require('./tutor');
const dialogs = require('./dialog');
const prompts = require('./prompt');
const action = require('./action');
const debug = require('debug')('slash-command-template:index');
const users = require('./users');
const app = express();
const UserModel = require('./model/user');
const TutorModel = require('./model/tutor');
const ReservationModel = require('./model/reservation');
const SubjectModel = require('./model/subject');

/*
 * Parse application/x-www-form-urlencoded && application/json
 */

app.use(bodyParser.urlencoded({
  extended: true
}));

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

controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {
  bot.reply(message, 'Hello <@'+message.user+'>');
  bot.reply(message, "Welcome to WolfTutor, an on-campus peer-to-peer tutoring system. You can help your peers to understand difficult concepts and also get help.\n Some things you can say \"I want to become a tutor\", \"I want to find a tutor\", \"Add review for my session\".");
  bot.reply(message, prompts.create_user_prompt);

});

controller.hears(['my points'], 'direct_message,direct_mention,mention', function(bot, message) {
  UserModel.fetch_user_points(message.user,function(points){
    bot.reply(message, 'Your points are : '+points);
    bot.reply(message, 'Keep tutoring to earn more points. #GoPack');
  });
});

controller.hears(['what can I do'], 'direct_message,direct_mention,mention', function(bot, message) {

  bot.reply(message, "You can enroll as a tutor by saying I want to be a tutor or become a tutor \nYou can find a tutor by saying find a tutor or I want a tutor.");
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

controller.hears(['find', 'need a tutor', 'find a tutor', 'want a tutor', 'select a tutor'],
    'direct_message,direct_mention,mention', function (bot, message) {

        //TODO put in a method
        var sub_list = '';
        controller.storage.subject.all(function (err, subjects) {
            //console.log(subjects);
            //Commenting old plain text logic of subjects
            for (var temp in subjects) {
                sub_list = sub_list + subjects[temp].name.toString() + '\n ';
            }
            //TODO- how to handle the error-string statement?
            if (err) {
                throw new Error(err);
            }

            var subjects_display_list = 'Choose one of the subjects :-' + '\n' + sub_list;
            //for(var sub in subjects) {
            var reply_with_attachments = {
                'attachments': [
                    {
                        fields: [
                            {
                                value: subjects_display_list,//subjects[sub].name,
                                short: true,
                            },]

                    }
                ],
            }

            // bot.reply(message, reply_with_attachments);
            //}

            //console.log(subjects_display_list);
            // bot.reply(message, subjects_display_list);
            bot.startConversation(message, function (err, convo) {

                convo.addQuestion(reply_with_attachments, function (response, convo) {
                    //  console.log(response.text);


                    //convo.say was not working
                    isValidSubject(response.text, function (flag) {
                        if (flag == true) {
                          bot.reply(convo.source_message, 'Cool, you selected: ' + response.text);
                          getTutorsForSubject(response.text, function (json_file) {
                                var count = 0;
                                for (var i in json_file) {
                                    count = count + 1;
                                }
                                // console.log("Json file length");
                                // console.log(count);
                                if (count == 0) {
                                    bot.reply(message, "Sorry! There are no tutor currently available for this course");
                                }
                                else
                                {
                                  for (var i in json_file)
                                  {
                                    bot.reply(message,
                                    {
                                        // "text": "Tutor Details",
                                        "attachments": 
                                        [
                                            {

                                                "fields":
                                                [
                                                 {
                                                    "title": 'Name',
                                                    "value": json_file[i].name,
                                                    "short":true,
                                                  },
                                                  {
                                                    "title": 'Email',
                                                    "value": json_file[i].email,
                                                    "short":true,
                                                  },
                                                  {
                                                    "title": 'Major',
                                                    "value": json_file[i].major,
                                                    "short":true,
                                                  },
                                                  {
                                                    "title": 'Degree',
                                                    "value": json_file[i].degree,
                                                    "short":true,
                                                  },
                                                  {
                                                    "title": 'Summary',
                                                    "value": json_file[i].summary,
                                                    "short":true,
                                                  },
                                                  {
                                                    "title": 'Rate',
                                                    "value": json_file[i].rate,
                                                    "short":true,
                                                  },

                                                ],

                                            },
                                            {
                                                "fallback": "Review and Scheduling",
                                                "title": "Review and Scheduling",
                                                "callback_id": "review_and_scheduling",
                                                "attachment_type": "default",
                                                "actions": [
                                                    {
                                                        "name": "review",
                                                        "text": "Review",
                                                        "type": "button",
                                                        "value": json_file[i].user_id,
                                                    },
                                                    {
                                                        "name": "schedule",
                                                        "text": "Schedule",
                                                        "type": "button",
                                                        "value": "schedule " + json_file[i].user_id,
                                                    }
                                                ]
                                            }
                                        ]
                                    });
                                  }
                                }
                            });
                        }
                        else {
                            bot.reply(convo.source_message, 'Please select a valid subject.');
                            convo.repeat();
                        }
                    });

                    //TODO this method directly prints the list of tutors, TODO get name based on user id
                    //getTutorsForSubject(response.text);

                    //console.log(tutorList);
                    convo.next();
                }, {}, 'default');
                //});
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

controller.hears(['slots'], 'direct_message,direct_mention,mention', function (bot, message) {

    // start a conversation to handle this response.
    bot.startConversation(message, function (err, convo) {
        // console.log('mongo');
        getAvailableSlotsTutor("5a760986734d1d3bd58c8cd1", 1, function (reservationSlots) {//user_id from tutor information
            if (reservationSlots==null) {
                convo.addQuestion('No tutor information available', function (response, convo) {
                    // bot.reply('Cool, you said: ' + response.text);
                    convo.next();

                }, {}, 'default');
            }

            console.log("IM ONLY LOOOOKKKKINININNGNN AT THIS");
            // console.log('reservations slots are :-'+reservationSlots);
            slots_temp = {};
            var slots_date = [];
            for(var r in reservationSlots){
                // console.log(r+' ')
                var reservation=reservationSlots[r];
                    // for(var rs in reservation){
                    //     console.log(rs+ ''+reservation[rs]);
                    // }
                    if(reservation['Date'].toString().slice(0,15) in slots_temp)
                    {
                      console.log("Yes");
                      //TODO appending
                    }
                    else
                    {
                      var temp_slot = reservation['from'].toString() + " "  + reservation['to'].toString();
                      slots_temp[reservation['Date'].toString().slice(0,15)] = {

                        "time" : temp_slot,
                        "available" : reservation['available'].toString(),
                      };
                      slots_date.push({
                        "text" : reservation['Date'].toString().slice(0,15),
                        "value" : reservation['Date'].toString().slice(0,15),
                      });
                      console.log("No");
                    }
                    // console.log(reservation['Date'].toString().slice(0,15));
                    // console.log(reservation['Day'].toString());
                    // console.log(reservation['from'].toString());
                    // console.log(reservation['to'].toString());
                    // console.log(reservation['available'].toString());
            }
            console.log(slots_date);
            // for(var i in slots_temp)
            // {
            //   console.log(i);
            //   console.log(slots_temp[i]);
            // }

            // action.send_message(payload.channel.id, '', {
            //     "text": "Would you like to play a game?",
            //     "response_type": "in_channel",
            //     "attachments": [
            //         {
            //             "fallback": "If you could read this message, you'd be choosing something fun to do right now.",
            //             "attachment_type": "default",
            //             "callback_id": "date_selection",
            //             "actions": [
            //                 {
            //                     "name": "date_list",
            //                     "text": "Pick a date...",
            //                     "type": "select",
            //                     "options": slots_date,
            //                 }
            //             ]
            //         }
            //     ]
            // })

        });
        // console.log('mongo');
    })
});

controller.hears(['My reservations'], 'direct_message,direct_mention,mention', function (bot, message) {
    // start a conversation to handle this response.
    bot.startConversation(message, function (err, convo) {
        console.log('Reservation start');
              //  convo.addQuestion('Here is the list of reservations', function (response, convo) {
        //get logged user name
        bot.api.users.info({user: message.user}, (error, response) => {
            let {id, name, real_name} = response.user;
        console.log(id, name, real_name);

        var loggedInUserId = id;
        //Here are your reservations as a tutor
        var reservationSlots=[];
        controller.storage.reservation.find({tutorid: loggedInUserId, active: 'yes'}, function (error, reservations) {
            //bot.reply(convo,)
            //reply the reservations with Date day from and to
            if(reservations!=null) {
                for (var r in reservations) {
                    reservationSlots.push({
                        Date: reservations[r].date,
                        Day: reservations[r].day,
                        from: reservations[r].from,
                        to: reservations[r].to,
                        available: reservations[r].available
                    })
                }
            }
        });
        //Here are your reservation as a tutee.
        controller.storage.reservation.find({userid: loggedInUserId, active: 'yes'}, function (error, reservations) {
            //reply the reservations with Date day from and to
            if(reservations!=null) {
                for (var r in reservations) {
                    reservationSlots.push({
                        Date: reservations[r].date,
                        Day: reservations[r].day,
                        from: reservations[r].from,
                        to: reservations[r].to
                    })
                }
            }
        });
        if(reservationSlots!=null){
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
        }}
        else{
            bot.reply(message,'No upcoming reservations');
        }
        },{},'default');

        });
        console.log('Reservation end');
});


var session_over = ['session a over', 'rate the tutor', 'add review', 'review']
controller.hears('review', 'direct_message', function(bot, message) {
  bot.reply(message, prompts.add_review_prompt);
});


app.get('/', (req, res) => {
  res.send('<h2>The Slash Command and Dialog app is running</h2> <p>Follow the' +
    ' instructions in the README to configure the Slack App and your environment variables.</p>');
});

app.post('/message', (req, res) => {

  var payload = JSON.parse(req.body.payload);
  var callback_id = payload.callback_id;
  const token = payload.token;
  const trigger_id = payload.trigger_id;
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {

    if (callback_id == 'become_tutor_prompt') {
      //console.log(payload);
      var checkValue = payload.actions[0].value;
      if (checkValue == 'no') {
        var text = 'Ok, you can enroll to become a tutor anytime.';
        action.send_message(payload.channel.id,text,[]);
      }
      else {
          // Yes on become a tutor prompt
          console.log("Dialog is");
          dialogs.submit_tutor_info_dialog(function(dialog_attachment){
            const dialog = {
              token: process.env.SLACK_ACCESS_TOKEN,
              trigger_id,
              dialog: JSON.stringify(dialog_attachment),
            };
            // open the dialog by calling dialogs.open method and sending the payload
            action.open_dialog(dialog,res);
          });
        } // End of Else
      } // End of If

    else if(callback_id=='submit_tutor_info_dialog'){
      // immediately respond with a empty 200 response to let
      // Slack know the command was received
      action.send_message(payload.channel.id, 'Thanks for submitting form', prompts.add_more_subjects_prompt);
      // create a tutor
      TutorModel.create_new_tutor(payload);
      //tutor.create(payload.user.id, payload.submission);
      res.send('');
    } // End of else if for submit tutor info
    else if (callback_id == 'add_more_subjects_prompt') {
      var checkValue = payload.actions[0].value;
      if (checkValue == 'no') {
        // Get the availibility Prompt
        action.send_message(payload.channel.id, 'Ok.', prompts.add_availability_prompt);
      } else {
        // Dialog for Adding a subject
        dialogs.add_more_subjects_dialog(function(dialog_attachment){        
          const dialog = {
          token: process.env.SLACK_ACCESS_TOKEN,
          trigger_id,
          dialog: JSON.stringify(dialog_attachment),
          };
          // open the dialog by calling dialogs.open method and sending the payload
          action.open_dialog(dialog,res);
        });
      } // End of else for add more subjects
    } // End of else if for tutor add subjects
    else if (callback_id == 'add_more_subjects_dialog') {
      action.send_message(payload.channel.id, 'Additional subjects added', prompts.add_more_subjects_prompt);
      // TODO Store add more subjects
      TutorModel.add_more_subjects(payload);
      res.send('');
    } else if (callback_id == 'add_availability_prompt') {
      const dialog = {
        token: process.env.SLACK_ACCESS_TOKEN,
        trigger_id,
        dialog: JSON.stringify(dialogs.add_availability_dialog),
      }
      // open the dialog by calling dialogs.open method and sending the payload
      action.open_dialog(dialog, res);
      //res.send('');
    } // End of else if for add more availability
    else if (callback_id=='add_availability_dialog') {
      var from_time = payload.submission.from_time_hour+payload.submission.from_time_min;
      var to_time = payload.submission.to_time_hour+payload.submission.to_time_min;
      if (from_time > to_time) {
        action.send_message(payload.channel.id,'From time cannot be after To time. Please add the availability again.',prompts.add_more_availability_prompt);
      }
      else {
        // Add availability to Database
        TutorModel.add_availability(payload);
        // Get the availibility Prompt
        action.send_message(payload.channel.id,'Availability added.',prompts.add_more_availability_prompt);
      }
      res.send('');
    } // End of else if of add availability dialog
    else if (callback_id == 'add_more_availability_prompt') {
      var checkValue = payload.actions[0].value;
      if (checkValue == 'no') {
        action.send_message(payload.channel.id, 'Ok. Thank you for enrolling as a tutor.')
      } else {
        // TutorModel.add_availability(payload);
        const dialog = {
          token: process.env.SLACK_ACCESS_TOKEN,
          trigger_id,
          dialog: JSON.stringify(dialogs.add_availability_dialog),
        }
        // open the dialog by calling dialogs.open method and sending the payload
        action.open_dialog(dialog, res);
      }
    } // End of else if of add more availability prompt
    else if (callback_id == 'review_and_scheduling') {
      var checkValue = payload.actions[0].value;
      console.log("###############################################################");
      console.log(checkValue);
      console.log(payload)
      if (checkValue.slice(0,8) == 'schedule')
      {
        getAvailableSlotsTutor("5a760986734d1d3bd58c8cd1", 1, function (reservationSlots) {//user_id from tutor information
            if (reservationSlots==null) {
                convo.addQuestion('No tutor information available', function (response, convo) {
                    // bot.reply('Cool, you said: ' + response.text);
                    convo.next();

                }, {}, 'default');
            }

            // console.log('reservations slots are :-'+reservationSlots);
            slots_temp = {};
            var slots_date = [];
            for(var r in reservationSlots){
                // console.log(r+' ')
                var reservation=reservationSlots[r];
                    // for(var rs in reservation){
                    //     console.log(rs+ ''+reservation[rs]);
                    // }
                    if(reservation['Date'].toString().slice(0,15) in slots_temp)
                    {
                      console.log("Yes, it already exist inside the list");
                      //TODO appending
                    }
                    else
                    {
                      var temp_slot = reservation['from'].toString() + " "  + reservation['to'].toString();
                      slots_temp[reservation['Date'].toString().slice(0,15)] = {

                        "time" : temp_slot,
                        "available" : reservation['available'].toString(),
                      };
                      if (reservation['available'].toString() == "yes")
                      {
                        slots_date.push({
                          "text" : reservation['Date'].toString().slice(0,15),
                          "value" : reservation['Date'].toString().slice(0,15) + " "+"5a760986734d1d3bd58c8cd1",
                        });
                      }
                    }
            }

            action.send_message(payload.channel.id, 'Slot Dates', 
            [
            {
              "fallback": "If you could read this message, you'd be choosing something fun to do right now.",
              "attachment_type": "default",
              "callback_id": "date_selection",
              "actions": [
                  {
                      "name": "date_list",
                      "text": "Pick a date...",
                      "type": "select",
                      "options": slots_date,
                  }
              ]
          }]);
        });
      }
      else
      {

          getTutorReview(checkValue, function(tutor_reviews)
          {

            console.log(tutor_reviews.length);
            console.log(tutor_reviews[2]);
              if(tutor_reviews[2] == ""){
                console.log("No reviews");
                action.send_message(payload.channel.id,"",
                [
                  {
                    title: 'No reviews for this tutor available',
                    callback_id: 'schedule_now',
                    attachment_type: 'default',
                    actions: [
                          {
                            "name":"schedule",
                            "text": "Schedule",
                            "value": tutor_reviews[0],
                            "type": "button",
                            }
                        ]
                    }
            ]);

              }
              else
              {
              const display_review = new Promise((resolve, reject) => {
                var tutor_name = '';
                controller.storage.user.all(function (err, users) {
                    for (var i in users) { 
                      if (tutor_reviews[0] == users[i]._id) {
                        tutor_name = users[i].name;  
                      }
                    }
                    resolve("Reviews for tutor : "+tutor_name);
                });

                
              });
              display_review.then((result) => {
                action.send_message(payload.channel.id,result,
                [
                  {
                  attachment_type: 'default',
                  callback_id: 'schedule_now',
                  fields:
                  [
                    {
                      "title": 'Review',
                      "value": tutor_reviews[1],
                      "short":true,
                    },
                    {
                      "title": 'Rating',
                      "value": tutor_reviews[2],
                      "short":true,
                    },
                  ],
                  actions: [
                      {
                          "name":"Schedule",
                          "text": "Schedule",
                          "value": tutor_reviews[0],
                          "type": "button",
                        },
                    ]

                  }
                ]);
                // resolve("OK");

              });
            }
          
          });
      }

    }
    else if(callback_id == 'schedule_now')
    {
      var checkValue = payload.actions[0].value;

      console.log(checkValue);
      getAvailableSlotsTutor("5a760986734d1d3bd58c8cd1", 1, function (reservationSlots) {//user_id from tutor information
            if (reservationSlots==null) {
                convo.addQuestion('No tutor information available', function (response, convo) {
                    // bot.reply('Cool, you said: ' + response.text);
                    convo.next();

                }, {}, 'default');
            }

            console.log('Mateen :-'+reservationSlots);
            slots_temp = {};
            var slots_date = [];
            for(var r in reservationSlots){
                // console.log(r+' ')
                var reservation=reservationSlots[r];
                    // for(var rs in reservation){
                    //     console.log(rs+ ''+reservation[rs]);
                    // }
                    if(reservation['Date'].toString().slice(0,15) in slots_temp)
                    {
                      console.log("Yes");
                      //TODO appending
                    }
                    else
                    {
                      var temp_slot = reservation['from'].toString() + " "  + reservation['to'].toString();
                      slots_temp[reservation['Date'].toString().slice(0,15)] = {

                        "time" : temp_slot,
                        "available" : reservation['available'].toString(),
                      };
                      if (reservation['available'].toString() == "yes")
                      {
                        slots_date.push({
                          "text" : reservation['Date'].toString().slice(0,15),
                          "value" : reservation['Date'].toString().slice(0,15) + " "+"5a760986734d1d3bd58c8cd1",
                        });
                      }
                      
                    }

            }

            action.send_message(payload.channel.id, 'Slot Dates', 
            [
            {
              "fallback": "If you could read this message, you'd be choosing something fun to do right now.",
              "attachment_type": "default",
              "callback_id": "date_selection",
              "actions": [
                  {
                      "name": "date_list",
                      "text": "Pick a date...",
                      "type": "select",
                      "options": slots_date,
                  }
              ]
          }]);
        });
    }
    else if(callback_id == 'date_selection' )
    {
      var checkValue = payload.actions[0].selected_options[0].value;
      var date_key = checkValue.toString().slice(0,15);
      var tutor_id = checkValue.toString().substr(16);
      console.log("RIKKKKKKKEEEEEENNNNN");
      console.log(tutor_id);
      getAvailableSlotsTutor("5a760986734d1d3bd58c8cd1", 1, function (reservationSlots) {//user_id from tutor information
            if (reservationSlots==null) {
                convo.addQuestion('No tutor information available', function (response, convo) {
                    // bot.reply('Cool, you said: ' + response.text);
                    convo.next();

                }, {}, 'default');
            }

            var slots_date = [];
            for(var r in reservationSlots){
                // console.log(r+' ')
                var reservation=reservationSlots[r];
                //     for(var rs in reservation){
                //         console.log(rs+ ''+reservation[rs]);
                //     }
                //     console.log(reservation['available'].toString());

                      if(reservation['Date'].toString().slice(0,15) == date_key)
                      {
                        // console.log("#######################################################");
                        // console.log(reservation['Date'].toString());
                        // console.log(reservation['from'].toString());
                        // console.log(reservation['to'].toString());
                        // console.log(reservation['available'].toString());
                        if(reservation['available'].toString() == "yes")
                        {
                          console.log(reservation['Date'].toString().slice(0,15) +" "+reservation['from'].toString()+" "+reservation['to'].toString());
                          action.send_message(payload.channel.id, 'Availabile Slots', 
                          [
                            {
                                title: reservation['Date'].toString().slice(4,15) +" "+reservation['from'].toString()+":"+reservation['to'].toString(),
                                callback_id: 'booking_now',
                                attachment_type: 'default',
                                actions: [
                                    {
                                        "name":"booking",
                                        "text": "Book",
                                        "value": tutor_id +" "+reservation['Date'].toString() +" "+reservation['from'].toString()+" "+reservation['to'].toString()+" "+reservation['Day'].toString(),
                                        "type": "button",
                                    }
                                ]
                            }
                        ]);
                      }

                      //TODO appending
                    }
                  
              }

            });

    }
    else if(callback_id == 'booking_now')
    {
      //TODO Point validation
      // console.log(payload.actions[0].value);
      var tutor_id = payload.actions[0].value.slice(0,24);
      var day = payload.actions[0].value.substr(75);
      var date = payload.actions[0].value.slice(29,40);
      var from = payload.actions[0].value.slice(65,69);
      var to = payload.actions[0].value.slice(70,74);
      action.send_message(payload.channel.id, "", [
      {

          title: 'Are you sure about this booking\n' + date +" "+from+":" +to,
          callback_id: 'save_booking',
          attachment_type: 'default',
          actions: [
              {
                  "name":"yes",
                  "text": "Yes",
                  "value": payload.actions[0].value+" yes",
                  "type": "button",
              },
              {
                  "name":"no",
                  "text": "No",
                  "value": payload.actions[0].value+" no",
                  "type": "button",
              }
          ]
        }
      ]);
     
    }
    else if(callback_id == 'save_booking')
    {
      console.log(payload);
      var tutor_id = payload.actions[0].value.slice(0,24);
      var day = payload.actions[0].value.substr(75,28);
      var date = payload.actions[0].value.slice(25,41)+"00:00:00 GMT-0500";
      var from = payload.actions[0].value.slice(65,69);
      var to = payload.actions[0].value.slice(70,74);
      var response = day.split(" ")[1].slice(0,1);
      day = day.split(" ")[0];
      var user_id = payload.user.id;
      console.log(tutor_id);
      console.log(user_id);
      if(response == 'y')
      {
        // Add points validation and reduce points
        // actions.send_user_notification(user_id, tutor_id, date, day, from, to);
        saveReservation(user_id, tutor_id, date, day, from, to);

      }
      else
      {
          console.log("Cancelled booking");
      }
    }
    else if(callback_id == 'create_user_prompt')
    {

      console.log(checkValue);
      if (checkValue == 'no') {
        action.send_message(payload.channel.id, "OK, you can enroll anytime");
      } else {
        tutor.new_user(payload.user.id, payload.submission);
        // UserModel.create_new_user(payload);
        // action.send_message(payload.channel.id, "Thank you for enrolling.");
        // const dialog = {
        // token: process.env.SLACK_ACCESS_TOKEN,
        // trigger_id,
        // dialog: JSON.stringify(dialogs.create_new_user_dialog),
        // }
        // // open the dialog by calling dialogs.open method and sending the payload
        // action.open_dialog(dialog,res);
      }
    } else if (callback_id == 'add_review_prompt') {
      const dialog = {
        token: process.env.SLACK_ACCESS_TOKEN,
        trigger_id,
        dialog: JSON.stringify(dialogs.add_review_dialog),
      }
      // open the dialog by calling dialogs.open method and sending the payload
      action.open_dialog(dialog, res);
    } // End of else if of add_review_prompt
    else if (callback_id == 'add_review_dialog') {
      // TODO Store review and rating into database
      UserModel.give_review(payload);
      action.send_message(payload.channel.id, 'Thank you so much. #GoPack', []);
      res.send('');

    } else {
      console.log('Reached Else');
      console.log(payload);
    }
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
  const query = req.body.event.text;
  console.log(query);
  if (query.match(/become a tutor/i)) {
    console.log('Yes He wants to bocome a Tutor');
  } else {
    console.log('No ');
  }
  console.log(req['body']);
  res.send(req.body.challenge);
});

app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}!`);
});

function isValidSubject(mysubject, callback) {
  var flag = false;
  controller.storage.subject.find({
      name: {
        $regex: new RegExp(mysubject.toString(), "i")
      } /*subject.toString()*/
    },
    function(error, subject) {
      if (error) {
        //return false;
      }
      console.log(subject);
      if (subject.length > 0 && mysubject.toString().toLowerCase() == subject[0].name.toLowerCase()) {
        console.log('valid subject');
        flag = true;
      }

      callback(flag);
    });

}

function getTutorReview(user_id, callback)
{
  var tutor_index = "";
  var tutor_reviews = "";
  var tutor_rating = "";
  controller.storage.tutor.all(function(err,tutors)
  {
    var json_file = {}
    for(var i in tutors)
    {
      if(tutors[i].user_id == user_id)
        {
          for(var j in tutors[i].reviews)
          {
            tutor_index+=(parseInt(j)+1).toString()+"\n";
            tutor_reviews+=tutors[i].reviews[j].text+"\n";
            tutor_rating+=tutors[i].reviews[j].rating+"\n";  
          }
          
        }
    }
    // console.log(tutor_reviews);
    callback([user_id,tutor_reviews,tutor_rating]);
  });
}

function getUserForSubject(json_file, callback)
{
    controller.storage.user.all(function (err, users)
    {
        for (var i in users)
        {
            for (var j in json_file)
            {
                if (json_file[j].user_id == users[i].user_id) {
                    json_file[j].name = users[i].name;
                    json_file[j].email = users[i].email;
                }
            }

        }
        callback(json_file);    
    });

}

function getTutorsForSubject(subject, callback) {
  controller.storage.tutor.all(function(err, tutors) {
    var json_file = {};
    for (var i in tutors) {
      // console.log(i);
      //Iterate through all the subjects to check if that subject is in tutor list or not
      for (var j in tutors[i].subjects) {
        //Check if that subject is taught by the tutor or not
        if (tutors[i].subjects[j].name == subject) {
          json_temp = {
            user_id: tutors[i].user_id,
            major: tutors[i].major,
            degree: tutors[i].degree,
            summary: tutors[i].summary,
            rate: tutors[i].overall_rating
          }
          json_file[tutors[i].user_id] = json_temp;
        }
      }
    }
    getUserForSubject(json_file, function(json_file) {
      callback(json_file);
    });
  });
}

//TODO my reservations option 14
function getAvailableSlotsTutor(tutorId, userId, callback) {
  //TODO reward points
  //**Check reward points of the user/tutee trying to reserve, give an error if he is left with insufficent points
  //**Get the availabilty of tutor
  controller.storage.tutor.find({
    user_id: tutorId
  }, function(error, tutor) {
    //no chances of invalid tutor id
    //console.log(tutor);
    if (tutor.length == 0) {
      //avl = 'No tutor found';
      return; //is return ok? or should I throw an exception?
    } else
      var avl = tutor[0].availability;
    //TODO remove it
    userId = '5a760a1f734d1d3bd58c8d16'; //using dummy user id

    //**get availabilities of the tutor for the tutee

    var currentDate = new Date();
    var currentDay = currentDate.getDay();
    var currentDateOnly = currentDate.getDate()
    //console.log(currentDate+' '+currentDay+' '+currentDateOnly);

    var dayMap = {};
    dayMap[0] = {
      day: 'Sunday'
    };
    dayMap[1] = {
      day: 'Monday'
    };
    dayMap[2] = {
      day: 'Tuesday'
    };
    dayMap[3] = {
      day: 'Wednesday'
    };
    dayMap[4] = {
      day: 'Thursday'
    };
    dayMap[5] = {
      day: 'Friday'
    };
    dayMap[6] = {
      day: 'Saturday'
    };

    //console.log('dayMap[5]'+dayMap[5].day);

    var dayNumMap = {};
    dayNumMap['Sunday'] = {
      day: '0'
    };
    dayNumMap['Monday'] = {
      day: '1'
    };
    dayNumMap['Tuesday'] = {
      day: '2'
    };
    dayNumMap['Wednesday'] = {
      day: '3'
    };
    dayNumMap['Thursday'] = {
      day: '4'
    };
    dayNumMap['Friday'] = {
      day: '5'
    };
    dayNumMap['Saturday'] = {
      day: '6'
    };

    //console.log('dayNumMap[Friday]'+dayNumMap['Friday'].day);

    var reservationSlots = {};
    //dummy entry of date TODO REMOVE
    //TODO test with starting day as wednesday
    //reservationSlots[currentDate.toString()+''+currentDate.getDay()]={Date:futureDate,Day:futureDay, from:'1900',to:'2000',available:'yes'};
    console.log(currentDate.toString() + '' + currentDate.getDay());
    for (var i in avl) {
      var availableDay = avl[i].day;
      var numberOfDays = (7 - currentDay + dayNumMap[availableDay].day) % 7;
      var futureDay = dayMap[numberOfDays].day;
      var futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + numberOfDays);
      //console.log(currentDate+' '+currentDay+' '+numberOfDays+' '+futureDate+' '+futureDay);
      console.log('future time stamp ' + futureDate.toString() + '' + futureDay);
      reservationSlots[futureDate.toString() + '' + futureDay] = {
        Date: futureDate,
        Day: futureDay,
        from: avl[i].from,
        to: avl[i].to,
        available: 'yes'
      };
    }

    //**Get existing reservation for the tutor, (what if tutee is busy at that time as per his old
    //reservation-tutee is busy at that time)

    controller.storage.reservation.find({
      tutorid: tutorId,
      active: 'yes'
    }, function(error, reservations) {
      //TODO null check for reservations
      //if(reservations.length==0)
      if (reservations.length > 0) {
        //console.log(reservations);
        for (var i in reservations) {
          //TODO mark reservations as active:'No' when a user reviews an old reservation
          //when you pull out reservations, make sure to mark the inactive ones as no, check current date and
          //if the reservation date has passed mark them inactive.
          /* if (reservations[i].date.getTime() < currentDate.getTime()) {
               console.log('inactive yes');
               //update old reservation, i.e. make it inactive
               controller.storage.reservation.save
           }*/

          //find that reservation in my list of reservations and mark as available to no,
          //we can make reservation slots as hashmap and easily search for a reservation based on
          //date+day concatanated string

          var reservationDay = new Date(reservations[i].date.toString());

          var existingReservationTimeStamp = reservationDay.toString() + '' + reservationDay.getDay();
          //console.log('existingReservationTimeStamp :' + existingReservationTimeStamp);
          if (reservationSlots[existingReservationTimeStamp] != null) {
            reservationSlots[existingReservationTimeStamp].available = 'No';
            //console.log('Match as implanted!');
          } //else
          //console.log('Yikes!');
          //return reservation logs
        }
      }
    });
    console.log('I am beyond save of reservation');
    callback(reservationSlots);
  });
}

//save reservation if user clicks on book button
function saveReservation(userId, tutorId, date, day, from, to) {
  //does not save if you donot send an id, if this id is sent as the same, old reservation is overwritten,[TBC]
  var reservation = {
    id: '5a80931df36d28314de95a74',
    tutorid: tutorId,
    userid: userId,
    date: currentDate,
    from: '0900',
    to: '1030',
    active: 'yes'
  };
  controller.storage.reservation.save(reservation, function(error) {
    if (error)
      console.log('There is an error');
  });

}