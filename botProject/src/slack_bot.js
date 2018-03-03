require('dotenv').config();

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const tutor = require('./tutor');
const subject = require('./subject');
const tutorSlot = require('./tutor_slot');
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
const Tutor_Display_Info = require('./prompt/tutor_info_prompt');
const DisplayDate = require('./prompt/display_date_prompt');
const TutorReview = require('./prompt/review_tutor_prompt');
const SubjectList = require('./prompt/subject_list_prompt');
const NoreviewSchedule = require('./prompt/noreview_schedule_prompt');
const SlotBooking = require('./prompt/slot_booking_prompt');
const BookingConfirmation = require('./prompt/booking_confirmation_prompt');


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

controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {
  bot.reply(message, 'Hello <@'+message.user+'>');
  bot.reply(message, "Welcome to WolfTutor, an on-campus peer-to-peer tutoring system. You can help your peers to understand difficult concepts and also get help.");
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

controller.hears(['find', 'need a tutor', 'find a tutor', 'want a tutor', 'select a tutor'],
    'direct_message,direct_mention,mention', function (bot, message) {

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
                convo.addQuestion(SubjectList.subject_list_display(subjects_display_list), function (response, convo) {
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
                                if (count == 0) {
                                    bot.reply(message, "Sorry! There are no tutor currently available for this course");
                                }
                                else
                                {
                                  for (var i in json_file)
                                  {
                                    console.log(Tutor_Display_Info);
                                    bot.reply(message, Tutor_Display_Info.tutor_info_display(json_file[i]));
                                  }
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
    res.send('<h2>The Slash Command and Dialog app is running</h2> <p>Follow the' +
    ' instructions in the README to configure the Slack App and your environment variables.</p>');
});

app.post('/message', (req, res) =>
{

    var payload = JSON.parse(req.body.payload);
    var callback_id = payload.callback_id;
    const token = payload.token;
    const trigger_id = payload.trigger_id;
    if (token === process.env.SLACK_VERIFICATION_TOKEN)
    {

        if (callback_id == 'become_tutor_prompt')
        {
            //console.log(payload);
          var checkValue = payload.actions[0].value;
          if (checkValue == 'no')
          {
              var text = 'Ok, you can enroll to become a tutor anytime.';
              action.send_message(payload.channel.id, text, []);
          }
          else
          {
              // Yes on become a tutor prompt
              console.log("Dialog is");
              dialogs.submit_tutor_info_dialog(function(dialog_attachment)
              {
                  const dialog =
                  {
                      token: process.env.SLACK_ACCESS_TOKEN,
                      trigger_id,
                      dialog: JSON.stringify(dialog_attachment),
                  };
                  // open the dialog by calling dialogs.open method and sending the payload
                  action.open_dialog(dialog, res);
              });
          } // End of Else
      } // End of If
      else if (callback_id == 'submit_tutor_info_dialog')
      {
        // immediately respond with a empty 200 response to let
        // Slack know the command was received
        action.send_message(payload.channel.id, 'Thanks for submitting form', prompts.add_more_subjects_prompt);
        // create a tutor
        TutorModel.create_new_tutor(payload);
        //tutor.create(payload.user.id, payload.submission);
        res.send('');
      } // End of else if for submit tutor info
      else if (callback_id == 'add_more_subjects_prompt')
      {
          var checkValue = payload.actions[0].value;
          if (checkValue == 'no') {
              // Get the availibility Prompt
              action.send_message(payload.channel.id, 'Ok.', prompts.add_availability_prompt);
          } else {
              // Dialog for Adding a subject
              dialogs.add_more_subjects_dialog(function(dialog_attachment) {
                  const dialog = {
                      token: process.env.SLACK_ACCESS_TOKEN,
                      trigger_id,
                      dialog: JSON.stringify(dialog_attachment),
                  };
                  // open the dialog by calling dialogs.open method and sending the payload
                  action.open_dialog(dialog, res);
              });
          } // End of else for add more subjects
      } // End of else if for tutor add subjects
      else if (callback_id == 'add_more_subjects_dialog')
      {
          action.send_message(payload.channel.id, 'Additional subjects added', prompts.add_more_subjects_prompt);
          // TODO Store add more subjects
          TutorModel.add_more_subjects(payload);
          res.send('');
      }
      else if (callback_id == 'add_availability_prompt')
      {
          const dialog =
          {
              token: process.env.SLACK_ACCESS_TOKEN,
              trigger_id,
              dialog: JSON.stringify(dialogs.add_availability_dialog),
          }
          // open the dialog by calling dialogs.open method and sending the payload
          action.open_dialog(dialog, res);
          //res.send('');
      } // End of else if for add more availability
      else if (callback_id == 'add_availability_dialog')
      {
        var from_time = payload.submission.from_time_hour + payload.submission.from_time_min;
        var to_time = payload.submission.to_time_hour + payload.submission.to_time_min;
        if (from_time > to_time)
        {
            action.send_message(payload.channel.id, 'From time cannot be after To time. Please add the availability again.', prompts.add_more_availability_prompt);
        }
        else
        {
            // Add availability to Database
            TutorModel.add_availability(payload);
            // Get the availibility Prompt
            action.send_message(payload.channel.id, 'Availability added.', prompts.add_more_availability_prompt);
        }
        res.send('');
      } // End of else if of add availability dialog
      else if (callback_id == 'add_more_availability_prompt')
      {
          var checkValue = payload.actions[0].value;
          if (checkValue == 'no')
          {
              action.send_message(payload.channel.id, 'Ok. Thank you for enrolling as a tutor.')
          }
          else
          {
              // TutorModel.add_availability(payload);
            const dialog =
            {
                token: process.env.SLACK_ACCESS_TOKEN,
                trigger_id,
                dialog: JSON.stringify(dialogs.add_availability_dialog),
            }
            // open the dialog by calling dialogs.open method and sending the payload
            action.open_dialog(dialog, res);
          }
      } // End of else if of add more availability prompt
      else if (callback_id == 'review_and_scheduling')
      {
        var checkValue = payload.actions[0].value;
        if (checkValue.slice(0, 8) == 'schedule')
        {
            tutorSlot.getAvailableSlotsTutor(checkValue.substr(9), 1, function(reservationSlots)
            {
                if (reservationSlots == null)
                {
                    convo.addQuestion('No tutor information available', function(response, convo)
                    {
                      convo.next();

                    },
                    {}, 'default');
                }

                slots_temp = {};
                var slots_date = [];
                for (var r in reservationSlots)
                {
                    var reservation = reservationSlots[r];
                    // for (var rs in reservation)
                    // {
                    //     console.log(rs + '' + reservation[rs]);
                    // }
                    if (reservation['Date'].toString().slice(0, 15) in slots_temp)
                    {
                        // console.log("Yes, it already exist inside the list");
                    }
                    else
                    {
                        var temp_slot = reservation['from'].toString() + " " + reservation['to'].toString();

                        slots_temp[reservation['Date'].toString().slice(0, 15)] =
                        {

                          "time": temp_slot,
                          "available": reservation['available'].toString(),
                        };

                        if (reservation['available'].toString() == "yes")
                        {
                            slots_date.push
                            (
                              {
                                "text": reservation['Date'].toString().slice(0, 15),
                                "value": reservation['Date'].toString().slice(0, 15) + " " + checkValue.substr(9),
                              }
                            );
                        }
                    }

                }

                if (slots_date.length == 0)
                {
                    action.send_message(payload.channel.id, "Sorry! There are no slots available for this tutor!");
                }
                else
                {
                    // console.log(slots_date);
                    action.send_message(payload.channel.id, 'Slot Dates', DisplayDate.tutor_date_display(slots_date));
                }
            });
        }
        else
        {
            tutor.getTutorReview(checkValue, function(tutor_reviews) {

              if (tutor_reviews[2] == "") {
                  // console.log("No reviews");
                  action.send_message(payload.channel.id, "", NoreviewSchedule.noreview_schedule(tutor_reviews[0]));

              }
              else
              {
                  const display_review = new Promise((resolve, reject) =>
                  {
                      var tutor_name = '';
                      controller.storage.user.all(function(err, users)
                      {
                          for (var i in users)
                          {
                              if (tutor_reviews[0] == users[i].user_id)
                              {
                                  tutor_name += users[i].name;
                              }
                          }
                          resolve("Reviews for tutor : " + tutor_name);
                      });


                  });

                  display_review.then((result) =>
                  {
                      action.send_message(payload.channel.id, result, TutorReview.tutor_review_display(tutor_reviews));
                  });
              }

          });
        }

      }
      else if (callback_id == 'schedule_now')
      {
          var checkValue = payload.actions[0].value;
          // console.log(checkValue);
          tutorSlot.getAvailableSlotsTutor(checkValue, 1, function(reservationSlots)
          { //user_id from tutor information

              if (reservationSlots == null)
              {
                  convo.addQuestion('No tutor information available', function(response, convo) {
                      convo.next();

                  },
                  {}, 'default');
              }

              slots_temp = {};
              var slots_date = [];
              for (var r in reservationSlots)
              {
                  var reservation = reservationSlots[r];
                  // console.log("############################");
                  // for(var rs in reservation){
                  //     console.log(rs+ ''+reservation[rs]);
                  // }
                  if (reservation['Date'].toString().slice(0, 15) in slots_temp)
                  {
                      // console.log("Yes, it already exist inside the list");
                  }
                  else
                  {
                      var temp_slot = reservation['from'].toString() + " " + reservation['to'].toString();
                      slots_temp[reservation['Date'].toString().slice(0, 15)] =
                      {

                          "time": temp_slot,
                          "available": reservation['available'].toString(),
                      };

                      if (reservation['available'].toString() == "yes")
                      {
                          slots_date.push(
                            {
                                "text": reservation['Date'].toString().slice(0, 15),
                                "value": reservation['Date'].toString().slice(0, 15) + " " + checkValue,
                            }
                          );
                      }
                  }

              }

              // console.log(slots_date.length);

              if (slots_date.length == 0)
              {

                  action.send_message(payload.channel.id, "Sorry! There are no slots available for this tutor!");

              }
              else
              {

                  action.send_message(payload.channel.id, 'Slot Dates', DisplayDate.tutor_date_display(slots_date));

              }

          });

      }
      else if (callback_id == 'date_selection')
      {
          var checkValue = payload.actions[0].selected_options[0].value;
          var date_key = checkValue.toString().slice(0, 15);
          var tutor_id = checkValue.toString().substr(16);
          tutorSlot.getAvailableSlotsTutor(tutor_id, 1, function(reservationSlots)
          { //user_id from tutor information
              if (reservationSlots == null)
              {
                  convo.addQuestion('No tutor information available', function(response, convo)
                  {
                      convo.next();

                  },
                  {}, 'default');
              }

              var flag_no_time_slot = 0;

              var slots_date = [];
              for (var r in reservationSlots)
              {

                  var reservation = reservationSlots[r];
                  if (reservation['Date'].toString().slice(0, 15) == date_key)
                  {

                      if (reservation['available'].toString() == "yes")
                      {
                          // console.log(reservation['Date'].toString().slice(0, 15) + " " + reservation['from'].toString() + " " + reservation['to'].toString());
                          flag_no_time_slot += 1;
                          var title_send = reservation['Date'].toString().slice(4, 15) + " " + reservation['from'].toString() + ":" + reservation['to'].toString();
                          var value_send = tutor_id + " " + reservation['Date'].toString() + " " + reservation['from'].toString() + " " + reservation['to'].toString() + " " + reservation['Day'].toString();
                          action.send_message(payload.channel.id, '', SlotBooking.slot_booking(title_send, value_send));
                      }
                  }
              }

              // console.log("#####No of availabe slots ###################");
              // console.log(flag_no_time_slot);

              if (flag_no_time_slot == 0)
              {
                  action.send_message(payload.channel.id, "Sorry! There are no slots availabe for this tutor on this day!");
              }

          });

      }
      else if (callback_id == 'booking_now')
      {
          var tutor_id = payload.actions[0].value.slice(0, 9);
          var day = payload.actions[0].value.substr(60);
          var date = payload.actions[0].value.slice(14, 25);
          var from = payload.actions[0].value.slice(50, 54);
          var to = payload.actions[0].value.slice(55, 59);
          console.log(payload.actions[0].value);

          var title_send = 'Are you sure about this booking\n' + date + " " + from + ":" + to;
          var value_send = payload.actions[0].value;
          action.send_message(payload.channel.id, "", BookingConfirmation.booking_confirmation(title_send, value_send));

      }
        else if (callback_id == 'save_booking')
        {
            var tutor_id = payload.actions[0].value.slice(0, 9);
            var day = payload.actions[0].value.substr(60);
            var date = payload.actions[0].value.slice(14, 25) + " 00:00:00 GMT-0500";
            var from = payload.actions[0].value.slice(50, 54);
            var to = payload.actions[0].value.slice(55, 59);
            var response = day.split(" ")[1].slice(0, 1);
            day = day.split(" ")[0];
            var user_id = payload.user.id;
           // console.log('date payload :'+payload.actions[0].value.slice(14, 25)+' and : '+payload.actions[0].value.slice(14, 50));
            if (response == 'y')
            {

                UserModel.fetch_user_points(user_id, function(err, user_points)
                {
                    TutorModel.fetch_tutor_rate(tutor_id, function(err, tutor_rate)
                    {
                        tutor_rate = tutor_rate / 2;
                        if (user_points >= tutor_rate)
                        {
                            console.log("Points Adjusted");
                            console.log(user_points);
                            console.log(tutor_rate);
                            UserModel.update_booking_points(user_id, tutor_id, tutor_rate);
                            ReservationModel.save_reservation(user_id, tutor_id, date, day, from, to);
                            UserModel.send_tutor_notification(user_id, tutor_id, date, day, from, to);
                            action.send_message(payload.channel.id, "Booking Confirmed! Thank you for booking.");
                        }
                        else
                        {
                            action.send_message(payload.channel.id, "You do not have enough points to book");
                        }
                    });
                });

            }
            else
            {
                action.send_message(payload.channel.id, "No Problem, You can reserve it later");
            }
        }
        else if (callback_id == 'create_user_prompt')
        {

            //console.log(payload.actions[0].value);
            var checkValue = payload.actions[0].value;
            if (checkValue == 'no')
            {
                action.send_message(payload.channel.id, "OK, you can enroll anytime!!!");
            }
            else
            {
                action.send_message(payload.channel.id, "Thank you for Enrolling in WolfTutor");
                action.send_message(payload.channel.id, "\n If you want to find a tutor type \"find a tutor\"\n If you want to Become a tutor in our system type \"become a tutor\"\n If you want to view your review a session type \"review\"\n If you want to view your rewards type \"rewards\"\n If you want to check your availability type \"my availability\"\n If you want to check the subjects you are teaching type \"my subjects\"\n If you want to check your reservations type \"my reservations\"\n If you want to know how to redeem your rewards type \"redeem\"\n If you want to buy points type \"buy\"");
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
        }
        else if (callback_id == 'add_review_prompt')
        {
            const dialog =
            {
                token: process.env.SLACK_ACCESS_TOKEN,
                trigger_id,
                dialog: JSON.stringify(dialogs.add_review_dialog),
            }
            // open the dialog by calling dialogs.open method and sending the payload
            action.open_dialog(dialog, res);
        } // End of else if of add_review_prompt
        else if (callback_id == 'add_review_dialog')
        {
            // TODO Store review and rating into database
            UserModel.give_review(payload);
            action.send_message(payload.channel.id, 'Thank you so much. #GoPack', []);
            res.send('');

        }
        else
        {
            console.log('Reached Else');
            console.log(payload);
        }
    }
    else
    {

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
}
else {
    console.log('No ');
}
console.log(req['body']);
res.send(req.body.challenge);
});

app.listen(process.env.PORT, () => {
    console.log(`App listening on port ${process.env.PORT}!`);
});
