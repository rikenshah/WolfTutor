require('dotenv').config();

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const tutor = require('./tutor');
const subject = require('./subject');
const tutorSlot = require('./tutor_slot');
const dialogs = require('./dialog.js');
const prompts = require('./prompt.js');
const action = require('./action');
const UserModel = require('../model/user');
const TutorModel = require('../model/tutor');
const ReservationModel = require('../model/reservation');
const SubjectModel = require('../model/subject');
const BookingValidation = require('./booking_validation');


module.exports = {
  handle: function (req,res) {
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
        console.log(checkValue);
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
                    action.send_message(payload.channel.id, 'Slot Dates', prompts.DisplayDate(slots_date));
                }
            });
        }
        else
        {
            tutor.getTutorReview(checkValue, function(tutor_reviews) {

              if (tutor_reviews[2] == "") {
                  // console.log("No reviews");
                  action.send_message(payload.channel.id, "", prompts.NoreviewSchedule(tutor_reviews[0]));

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
                      action.send_message(payload.channel.id, result, prompts.TutorReview.tutor_review_display(tutor_reviews));
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

                  action.send_message(payload.channel.id, 'Slot Dates', prompts.DisplayDate(slots_date));

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
                          action.send_message(payload.channel.id, '', prompts.SlotBooking(title_send, value_send));
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
          var user_id = payload.user.id;

          console.log(tutor_id, day, date, from, to);
          var full_date = date+ " 00:00:00 GMT-0500";
          //Dynamic and fetch userid
          BookingValidation.bookingValidation(user_id, full_date, day, from, to, function(flag)
          {
            flag = 'false';
            console.log(flag, user_id, full_date, day, from, to);
            if(flag == true)
            {
              console.log("True");
              var title_send = 'Are you sure about this booking\n' + date + " " + from + ":" + to;
              var value_send = payload.actions[0].value;
              action.send_message(payload.channel.id, "", prompts.BookingConfirmation(title_send, value_send));
            }
            else
            {
              console.log("False",tutor_id+" schedule");

              action.send_message(payload.channel.id, "Sorry, you already have a booking with other tutor at the same time.");
              action.send_message(payload.channel.id, "",
                [
                  {
                    title: 'Do you want to book other slot?',
                    callback_id: 'review_and_scheduling',
                    attachment_type: 'default',
                    actions: 
                    [
                      {
                        "name": "yes",
                        "text": "Yes",
                        "value": "schedule "+ tutor_id,
                        "type": "button",
                      }
                    ]
                  }
                ]

              );
            }
          });

    

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
  }
}
