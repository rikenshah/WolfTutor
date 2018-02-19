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
const app = express();

/*
 * Parse application/x-www-form-urlencoded && application/json
 */

app.use(bodyParser.urlencoded({extended: true}));

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

controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function (bot, message) {

    // bot.api.reaction.add({
    //     timestamp: message.ts,
    //     channel: message.channel,
    //     name: 'robot_face',
    // }, function(err, res) {
    //     if (err) {
    //         bot.botkit.log('Failed to add emoji reaction :(', err);
    //     }
    // });



    controller.storage.users.get(message.user, function (err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!!');
        } else {
            bot.reply(message, 'Hello.');
        }
    });
});

controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function (err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user, function (err, id) {
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
                                console.log("Json file length");
                                console.log(count);
                                if (count == 0) {
                                    bot.reply(message, "Sorry! There are no tutor avaible for this course");
                                }
                                else {
                                    for (var i in json_file) {
                                        bot.reply(message,
                                            {
                                                attachments:
                                                    [
                                                        {
                                                            fields:
                                                                [
                                                                    {
                                                                        title: 'Name',
                                                                        value: json_file[i].name,
                                                                        short: true,
                                                                    },
                                                                    {
                                                                        title: 'Email',
                                                                        value: json_file[i].email,
                                                                        short: true,
                                                                    },
                                                                    {
                                                                        title: 'Major',
                                                                        value: json_file[i].major,
                                                                        short: true,
                                                                    },
                                                                    {
                                                                        title: 'Degree',
                                                                        value: json_file[i].degree,
                                                                        short: true,
                                                                    },
                                                                    {
                                                                        title: 'Summary',
                                                                        value: json_file[i].summary,
                                                                        short: true,
                                                                    },
                                                                    {
                                                                        title: 'Rate',
                                                                        value: json_file[i].rate,
                                                                        short: true,
                                                                    },

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


app.get('/', (req, res) => {
    res.send('<h2>The Slash Command and Dialog app is running</h2> <p>Follow the' +
    ' instructions in the README to configure the Slack App and your environment variables.</p>');
})
;

app.post('/message', (req, res) => {

  var payload = JSON.parse(req.body.payload);
  var callback_id = payload.callback_id;
  const token = payload.token;
  const trigger_id = payload.trigger_id;
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {

    if(callback_id=='become_tutor_prompt'){
      console.log(payload);
      var checkValue = payload.actions[0].value;
      if (checkValue == 'no') {
        var text = 'Ok, you can enroll to become a tutor anytime.';
        action.send_message(payload.channel.id,text,[]);
      }
      else {
          // Yes on become a tutor prompt
          const dialog = {
          token: process.env.SLACK_ACCESS_TOKEN,
          trigger_id,
          dialog: JSON.stringify(dialogs.submit_tutor_info_dialog),
        };
        // open the dialog by calling dialogs.open method and sending the payload
        action.open_dialog(dialog,res);
        } // End of Else
      } // End of If

    else if(callback_id=='submit_tutor_info_dialog'){
      // immediately respond with a empty 200 response to let
      // Slack know the command was received
      //res.send('');
      console.log(payload);
      action.send_message(payload.channel.id,'Thanks for submitting form',prompts.add_more_subjects_prompt);
      // create tutor
      //tutor.create(payload.user.id, payload.submission);
      res.send('');
    } // End of else if for submit tutor info
    else if (callback_id =='add_more_subjects_prompt') {
      var checkValue = payload.actions[0].value;
      if (checkValue == 'no') {
        // Get the availibility Prompt
        action.send_message(payload.channel.id,'Ok.',prompts.add_availability_prompt);
      } else {
        // Dialog for Adding a subject
        const dialog = {
        token: process.env.SLACK_ACCESS_TOKEN,
        trigger_id,
        dialog: JSON.stringify(dialogs.add_more_subjects_dialog),
        };
        // open the dialog by calling dialogs.open method and sending the payload
        action.open_dialog(dialog,res);
        //res.send('');
        // TODO Store in database subjects
      } // End of else for add more subjects
    } // End of else if for tutor add subjects
    else if (callback_id=='add_more_subjects_dialog') {
      action.send_message(payload.channel.id,'Additional subjects added',prompts.add_more_subjects_prompt);
      // TODO Store add more subjects
      res.send('');
    }
    else if (callback_id=='add_availability_prompt') {
      const dialog = {
      token: process.env.SLACK_ACCESS_TOKEN,
      trigger_id,
      dialog: JSON.stringify(dialogs.add_availability_dialog),
      }
      // open the dialog by calling dialogs.open method and sending the payload
      action.open_dialog(dialog,res);
      //res.send('');
    } // End of else if for add more availability
    else if (callback_id=='add_availability_dialog') {
      // TODO: On Subission of Dialog
      // Add availability to Database


      // Get the availibility Prompt
      action.send_message(payload.channel.id,'Availability added.',prompts.add_more_availability_prompt);
      res.send('');
    } // End of else if of add availability dialog
    else if (callback_id=='add_more_availability_prompt') {
      var checkValue = payload.actions[0].value;
      if (checkValue == 'no') {
        action.send_message(payload.channel.id,'Ok. Thank you for enrolling as a tutor.')
      } else {
        const dialog = {
        token: process.env.SLACK_ACCESS_TOKEN,
        trigger_id,
        dialog: JSON.stringify(dialogs.add_availability_dialog),
        }
        // open the dialog by calling dialogs.open method and sending the payload
        action.open_dialog(dialog,res);
      }
    } // End of else if of add more availability prompt
    else {
      console.log('Reached Else');
      console.log(payload);
    }
  } else {
    debug('Verification token mismatch');
    console.log('Failed Here');
    res.sendStatus(403);
}});


app.post('/botactivity', (req, res) => {
    console.log(req['body']['event']['text']);
// Will need to verify the challenge parameter first
res.send("I am here");
//console.log(req['body']['event']['text']);
//res.send("I am here");
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
// console.log(req);
// res.send('');
})
;


app.listen(process.env.PORT, () => {
    console.log(`App listening on port ${process.env.PORT}!`);
})
;


function isValidSubject(mysubject, callback) {
    var flag = false;
    controller.storage.subject.find({name: {$regex: new RegExp(mysubject.toString(), "i")}/*subject.toString()*/},
        function (error, subject) {
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


function getUserForSubject(json_file, callback) {

    // console.log(json_file);
    // console.log("++++++++++++++++++++++");
    controller.storage.user.all(function (err, users) {
        for (var i in users) {
            // console.log(users[i]._id);
            for (var j in json_file) {
                if (json_file[j].user_id == users[i]._id) {
                    json_file[j].name = users[i].name;
                    json_file[j].email = users[i].email;
                }
            }
        }
        // console.log(json_file);
        callback(json_file);
    });

}

function getTutorsForSubject(subject, callback) {


    controller.storage.tutor.all(function (err, tutors) {
        //var tutorList = [];
        var json_file = {};
        //tutorList.push('Hello');
        // console.log(tutors);
        // console.log("------------------------------------");
        for (var i in tutors) {
            // console.log(i);

            //Iterate through all the subjects to check if that subject is in tutor list or not
            for (var j in tutors[i].subjects) {
                // console.log("++++++++++++++++++++++++++++");
                // console.log(j);
                //Check if that subject is taught by the tutor or not
                if (tutors[i].subjects[j].name == subject) {
                    //  tutorList.push(tutors[i].user_id);
                    // tutorList.push(tutors[i].user_id);

                    json_temp =
                        {
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
        // for(var i in json_file)
        // {
        //  console.log(json_file[i].major);
        //  json_file[i].aaroh = "Aaroh";

        // }
        // console.log(json_file);
        // console.log("++++++++++++++++++++++++++");
        getUserForSubject(json_file, function (json_file) {
            // console.log(json_file);
            callback(json_file);
        });


    });
}

const sendConfirmation = (tutor) => {
    console.log("In confirmation");
    axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
        token: process.env.SLACK_ACCESS_TOKEN,
        channel: tutor.userId,
        text: 'Tutor created!',
        attachments: JSON.stringify([
            {
                title: `Tutor profile created for ${tutor.userName}`,
                // Get this from the 3rd party helpdesk system
                //title_link: 'http://example.com',
                text: tutor.text,
                fields: [
                    {
                        title: 'Major',
                        value: tutor.major,
                        short: true,
                    },
                    {
                        title: 'Degree',
                        value: tutor.degree,
                        short: true,
                    },
                    {
                        title: 'Subjects',
                        value: tutor.subject,
                        short: true,
                    },
                    {
                        title: 'Rate',
                        value: tutor.rate,
                    },
                    {
                        title: 'Summary',
                        value: tutor.summary || 'None provided',
                    },
                ],
            },
        ]),
    })).then((result) => {
        debug('sendConfirmation: %o', result.data
)
    ;
}).
    catch((err) => {
        debug('sendConfirmation error: %o', err
)
    ;
    console.error(err);
})
    ;
}
;

controller.hears(['slots'], 'direct_message,direct_mention,mention', function (bot, message) {

    // start a conversation to handle this response.
    bot.startConversation(message, function (err, convo) {
        getAvailableSlotsTutor("U84DXQKPL", 1, function (reservationSlots) {//user_id from tutor information
            if (reservationSlots==null) {
                convo.addQuestion('No tutor information available', function (response, convo) {
                    // bot.reply('Cool, you said: ' + response.text);
                    console.log('reservations slots are :-'+reservationSlots);
                    for(var r in reservationSlots){
                        console.log(r+' ')
                        var reservation=reservationSlots[r];
                        for(var rs in reservation){
                            console.log(rs+ ''+reservation[rs]);
                        }
                    }
                    convo.next();

                }, {}, 'default');
            }/*
            console.log('reservations slots are :-'+reservationSlots);
            for(var r in reservationSlots){
                console.log(r+' ')
                var reservation=reservationSlots[r];
                    for(var rs in reservation){
                        console.log(rs+ ''+reservation[rs]);
                    }
            }*/

        });
    })
});

controller.hears(['My reservations'], 'direct_message,direct_mention,mention', function (bot, message) {
    bot.startConversation(message, function (err, convo) {
        console.log('Reservation start');
        bot.api.users.info({user: message.user}, (error, response) => {
            let {id, name, real_name} = response.user;
        console.log(id, name, real_name);

        var loggedInUserId = id;//'U84DXQKPL';//id;
        //Here are your reservations as a tutor
            var hasReservationTutee=new Boolean(false);
            var hasReservationTutor=new Boolean(false);
            controller.storage.reservation.find({tutorid: loggedInUserId, active: 'yes'}, function (error, reservations) {
            if (reservations != null && reservations.length>0) {
                //console.log(reservations);
                hasReservationTutor=new Boolean(true);
                //console.log(hasReservationTutor);
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
                /*for (var r in reservations) {
                    {
                        var res = {
                            Date: reservations[r].date,
                            Day: reservations[r].day,
                            from: reservations[r].from,
                            to: reservations[r].to,
                            available: reservations[r].available
                        };
                        reservationSlots.push(res);
                    }
                }*/

            }
        });
        //Here are your reservation as a tutee.
        controller.storage.reservation.find({userid: loggedInUserId, active: 'yes'}, function (error, reservations) {
            if (reservations != null && reservations.length>0) {
                //console.log(reservations);
                /*

                                    for (var r in reservations) {
                                        {
                                            var res = {
                                                Date: reservations[r].date,
                                                Day: reservations[r].day,
                                                from: reservations[r].from,
                                                to: reservations[r].to
                                            };
                                            reservationSlots.push(res);
                                        }
                                    }*/
                hasReservationTutee=new Boolean(true);
                //console.log(hasReservationTutee);
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

        });
        if(hasReservationTutee!=true && hasReservationTutor!=true)
            bot.reply(message, 'No upcoming reservations');

    });
        convo.stop();
    });
});


function getAvailableSlotsTutor(tutorId, userId, callback) {
    //TODO reward points
    //**Check reward points of the user/tutee trying to reserve, give an error if he is left with insufficent points
    controller.storage.tutor.find({user_id: tutorId}, function (error, tutor) {

        if (tutor.length==null||tutor.length==0) {
            console.log('No Tutors found');
            return;
        }
        else
            var avl = tutor[0].availability;

        //**get availabilities of the tutor for the tutee

        var currentDate = new Date();
        var currentDay = currentDate.getDay();
        var currentDateOnly = currentDate.getDate()

        var dayMap = {};
        dayMap[0] = {day: 'Sunday'};
        dayMap[1] = {day: 'Monday'};
        dayMap[2] = {day: 'Tuesday'};
        dayMap[3] = {day: 'Wednesday'};
        dayMap[4] = {day: 'Thursday'};
        dayMap[5] = {day: 'Friday'};
        dayMap[6] = {day: 'Saturday'};

        var dayNumMap = {};
        dayNumMap['Sunday'] = {day: '0'};
        dayNumMap['Monday'] = {day: '1'};
        dayNumMap['Tuesday'] = {day: '2'};
        dayNumMap['Wednesday'] = {day: '3'};
        dayNumMap['Thursday'] = {day: '4'};
        dayNumMap['Friday'] = {day: '5'};
        dayNumMap['Saturday'] = {day: '6'};

        var reservationSlots = {};

        for (var i in avl) {
            var availableDay = avl[i].day;
            var availableDaykey=dayNumMap[availableDay];
            var availabeDayVal;//Corresponding numeric value

            for(var v in availableDaykey){
                if(v=='day')
                    availabeDayVal=availableDaykey[v];
            }

            var numberOfDays = (Number(7 - currentDay) + Number(availabeDayVal))%7;
            var futureDay = dayMap[availabeDayVal].day;
           // console.log('no of days'+numberOfDays+'currentDay'+currentDay);
            var futureDate = new Date();

            futureDate.setDate(futureDate.getDate() + numberOfDays);
            //We just need date, no need to store timestamp of when the reservation is made
            futureDate.setHours(0,0,0,0);
            //TODO same day availability
            if(availabeDayVal==currentDay){
                /*if(futureDate.

                    ()>)*/
            }
            //
            var slots=[];
            for(j=Number(avl[i].from);j<Number(avl[i].to);){
                //console.log('j:'+j+'startTime :'+startTime+' '+endTime);
                var startTime=j.toString();
                var endTime='';
                //console.log('start time is '+startTime);
                if(startTime.includes('00',2)||startTime.includes('00',1)) {
                    endTime = Number(j + 30).toString();
                    j=j+30;
                    //console.log('I include 00');
                }
                else {
                    endTime = Number(j + 70).toString();
                    j=j+70;
                    //console.log('I include 30');
                }
                //console.log('j:'+j+'startTime :'+startTime+' '+endTime);
                slots={from:startTime,to:endTime};
                //console.log('from:'+startTime+',to:'+endTime);
                if(startTime.length==3)
                    startTime='0'+startTime;
                if(endTime.length==3)
                    endTime='0'+endTime;
              //  console.log('from:'+startTime+',to:'+endTime);
                //saving 30 minutes reservation slots
                var futureReservationTimeStamp=futureDate.getFullYear()+''+futureDate.getMonth()+''+
                    futureDate.getDate() + '' + futureDay+''+startTime+''+endTime;
                console.log('futureReservationTimeStamp is :'+futureReservationTimeStamp);
                reservationSlots[futureReservationTimeStamp] = {
                    Date: futureDate,
                    Day: futureDay,
                    from: startTime,
                    to: endTime,
                    available: 'yes'
                };
            }
        }

        //**Get existing reservation for the tutor, (what if tutee is busy at that time as per his old
        //reservation-tutee is busy at that time)

        controller.storage.reservation.find({tutorid: tutorId, active: 'yes'}, function (error, reservations) {

            if (reservations.length > 0) {
                console.log(reservations);
                for (var i in reservations) {
                    //TODO mark reservations as active:'No' when a user reviews an old reservation
                    //when you pull out reservations, make sure to mark the inactive ones as no, check current date and
                    //if the reservation date has passed mark them inactive.
                    /* if (reservations[i].date.getTime() < currentDate.getTime()) {
                         console.log('inactive yes');
                         //update old reservation, i.e. make it inactive
                         controller.storage.reservation.save
                     }*/

                    var reservationDay = new Date(reservations[i].date.toString());
                   // console.log('reservationDay'+reservationDay);
                    var existingReservationTimeStamp = reservationDay.getFullYear()+''+reservationDay.getMonth()+''+
                        reservationDay.getDate() + '' + reservations[i].day+'' +reservations[i].from+''+
                        reservations[i].to;
                    console.log('existing reservations timestamp :'+existingReservationTimeStamp);
                    // if(existingReservationTimeStamp.equals())
                     //   console.log('equal');
                    //else
                      //  consolelog('Not equal');
                    if (reservationSlots[existingReservationTimeStamp] != null) {
                        console.log('Oh no! '+existingReservationTimeStamp+'is already reserved');
                        reservationSlots[existingReservationTimeStamp].available = 'No';
                        console.log('updated value of availabe slot is '+reservationSlots[existingReservationTimeStamp].available);
                    }
                    else{//adde only for testing purposes
                        console.log(existingReservationTimeStamp+'is not already reserved');
                    }

                }
            }
        });
        callback(reservationSlots);
    });
}

//save reservation if user clicks on book button
function saveReservation(userId, tutorId, date, day, from, to) {
    //does not save if you donot send an id, if this id is sent as the same, old reservation is overwritten,[TBC]
    var reservation = {
        id: userId, tutorid: tutorId, userid: userId, date: currentDate, from: '0900', to: '1030',
        active: 'yes'
    };
    controller.storage.reservation.save(reservation, function (error) {
        if (error)
            console.log('There is an error');
    });

}
//Method for a user to view rewards
controller.hears(['rewards','get my rewards','view my rewards'], 'direct_message,direct_mention,mention', function (bot, message) {
    bot.startConversation(message, function (err, convo) {

        console.log('rewards start');
        bot.api.users.info({user: message.user}, (error, response) => {
            let {id, name, real_name} = response.user;
        console.log(id, name, real_name);
        //TODO replace with logged in user
        var loggedInUserId = id;//'U94AXQ6RL';//id;//

        controller.storage.user.find({user_id: loggedInUserId}, function (error, users) {
            if (users != null || users.length > 0) {
                //update the user rewards
                console.log(users);
                bot.reply(message, 'Your Reward points are ' + users[0].points);
                convo.stop();
            }

        });
    });
        console.log('rewards end');
    });
});


//bot.reply(message, {
//  attachments:
//  [
//    {
//    fields: [
//            {
//                title: 'Major',
//                value: tutors[i].subjects,
//                short:true,
//        },
//        {
//                title: 'Degree',
//                value: tutors[i].degree,
//                short:true,
//        }

//      ]
//    }
//  ]
// });


// controller.storage.tutor.all(function(err,tutors){
// for(var i in tutors) {
//  console.log(i);
//  //console.log("+++++++++++++++++++++++++++++++++++++++++++++++");
//  // console.log(tutors[i].subjects);
//  //sendConfirmation(tutors);
//  for(var j in tutors[i].subjects)
//  {
//    // console.log(tutors[i].subjects[j].name);
//    if (tutors[i].subjects[j].name == response.text)
//    {
//      var user_details;
//      controller.storage.user.all(function(err,users){
//        // console.log("+++++++++++++++++++++++++++++++++++++++++++++++");
//        // console.log(tutors[i]);
//        for (var ids in users)
//        {
//          // console.log(tutors[i].user_id);
//          // console.log(users[ids]._id);
//          if (tutors[i].user_id == users[ids]._id)
//          {
//            user_details = users[ids];
//            console.log("---------------------------------------");
//            console.log(user_details);
//            break;
//          }
//        }
//      });
//      console.log(user_details);
//      //console.log(users[ids]);
//      bot.reply(message, {
//        attachments:
//        [
//          {
//          fields: [
//                  {
//                      title: 'Major',
//                      value: tutors[i].subjects,
//                      short:true,
//              },
//              {
//                      title: 'Degree',
//                      value: tutors[i].degree,
//                      short:true,
//              }

//            ]
//          }
//        ]
//      });
//    }
//  }
// }
// });

