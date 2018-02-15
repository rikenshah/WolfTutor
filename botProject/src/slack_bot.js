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
var mongoStorage = require('botkit-storage-mongo')({mongoUri: process.env.MONGO_CONNECTION_STRING, tables: ['user','tutor','subject']});
var os = require('os');

var controller = Botkit.slackbot({
    storage: mongoStorage,
});

var bot = controller.spawn({
    token: process.env.BOT_TOKEN
}).startRTM();

controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {
     
     bot.reply(message, "You can enroll as a tutor by saying I want to be a tutor or become a tutor \nYou can find a tutor by saying find a tutor or I want a tutor." );
     bot.reply(message, prompts.create_user_prompt);

  
});

controller.hears(['what can I do'], 'direct_message,direct_mention,mention', function(bot, message) {
     
    bot.reply(message, "You can enroll as a tutor by saying I want to be a tutor or become a tutor \nYou can find a tutor by saying find a tutor or I want a tutor." );  
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
                        {
                            bot.reply(convo.source_message, 'Cool, you selected: ' + response.text);
                            getTutorsForSubject(response.text, function(json_file)
                              {
                                var count = 0;
                                for (var i in json_file)
                                {
                                    count = count+1;
                                }
                                console.log("Json file length");
                                console.log(count);
                                if (count == 0)
                                {
                                  bot.reply(message, "Sorry! There are no tutor avaible for this course");
                                }
                                else
                                {
                                  for (var i in json_file)
                                  {
                                    bot.reply(message, 
                                    {
                                        "text": "Tutor Details",
                                        "attachments": [
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
                                                        "value": json_file[i].user_id
                                                    },
                                                    {
                                                        "name": "schedule",
                                                        "text": "Schedule",
                                                        "type": "button",
                                                        "value": "schedule"
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

controller.hears('become a tutor', 'direct_message', function(bot, message) {
    bot.reply(message, prompts.become_tutor_prompt);
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
    else if (callback_id == 'review_and_scheduling') {
      console.log("+++++++++++++++++++++++++++++++++++++++");
      var checkValue = payload.actions[0].value;
      console.log(checkValue);
      if (checkValue == 'schedule')
      {

      }
      else
      {
        
          getTutorReview(checkValue, function(json_file)
          {
            console.log(json_file.review);
            console.log("++++++++++");
            // const display_review = new Promise((resolve, reject) => {
            //   console.log("Review 1111111111");
            //   resolve("Review 22222222222222");
            // });
            // display_review.then(function(value){
            //   console.log(value);
            // });

            const display_review = new Promise((resolve, reject) => {
                console.log(json_file);
                if(json_file.review == undefined)
                {
                  action.send_message(payload.channel.id, 'Sorry we don not have any review for this tutor at this time');
                  resolve("OK");
                }
                for(var i in json_file.review)
                {

                  console.log("-----------------------");
                   console.log(json_file.review[i].text);
                   console.log(json_file.review[i].rating);
                  action.send_message(payload.channel.id,'',
                  [
                    {
                    callback_id: 'schedule_now',
                    attachment_type: 'default',
                    fields:
                    [
                      {
                        "title": 'Review',
                        "value": json_file.review[i].text,
                        "short":true,
                      },
                    {
                      "title": 'Rating',
                      "value": json_file.review[i].rating,
                      "short":true,
                    },
                    ],
                    // actions: [
                    //     {
                    //         "name":"schedule",
                    //         "text": "Schedule",
                    //         "value": "schedule",
                    //         "type": "button",
                    //     },
                        // {
                        //     "name":"no",
                        //     "text": "No",
                        //     "value": "no",
                        //     "type": "button",
                        // }
                    // ]
                    }
                  ]
                  // {
                  //   "text": "Tutor Details",
                  //   "attachments": [
                  //       {
                            
                  //           "fields": 
                  //           [
                  //            {
                  //               "title": 'Review',
                  //               "value": json_file.review[i].text,
                  //               "short":true,
                  //             },
                  //             {
                  //               "title": 'Rating',
                  //               "value": json_file.review[i].rating,
                  //               "short":true,
                  //             },
                  //           ]
                  //       }
                  //                 ]
                  // }
                  );
                }
                resolve("OK");
            });
            display_review.then((result) => {
              action.send_message(payload.channel.id,'',
              [
                {
                  title: 'Do you want to schedule a tutoring session?',
                  callback_id: 'schedule_now',
                  attachment_type: 'default',
                  actions: [
                      {
                          "name":"Schedule",
                          "text": "Schedule",
                          "value": "schedule",
                          "type": "button",
                      },
                      // {
                      //     "name":"no",
                      //     "text": "No",
                      //     "value": "no",
                      //     "type": "button",
                      // }
                  ]
                }
              ]
            );
            });
            
            

          }); 
      }
      
    }
    else if(callback_id == 'create_user_prompt')
    {
      console.log(checkValue);
      if (checkValue == 'no')
      {
        action.send_message(payload.channel.id, "OK, you can enroll anytime");
      }
      else
      {
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
    else if(callback_id == 'create_new_user_dialog')
    {
      console.log("____________");
      var checkValue = payload.actions[0].value;
      console.log(checkValue);
      if (checkValue == 'no')
      {
        action.send_message(payload.channel.id, "OK, you can enroll anytime");
      }
      else
      {
          UserModel.create_new_user(payload);
          action.send_message(payload.channel.id, "Thank you for enrolling.");
      }
    }
    else if(callback_id == 'create_user_prompt')
    {
      console.log("____________");
      console.log(payload);
      var checkValue = payload.actions[0].value;

      console.log(checkValue);
      if (checkValue == 'no')
      {
        action.send_message(payload.channel.id, "OK, you can enroll anytime");
      }
      else
      {
          UserModel.create_new_user(payload);
          action.send_message(payload.channel.id, "Thank you for enrolling.");
      }
    }
    else {
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
  // console.log(req['body']['event']['text']);
  // // Will need to verify the challenge parameter first
  // res.send("I am here");
  // //console.log(req['body']['event']['text']);
  // //res.send("I am here");
  // const query = req.body.event.text;
  // console.log(query);
  // if(query.match(/become a tutor/i)) {
  //   console.log('Yes He wants to bocome a Tutor');
  // }
  // else {
  //   console.log('No ');
  // }
  // console.log(req['body']);
  res.send(req.body.challenge);
  // console.log(req);
  // res.send('');
});


app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}!`);
});



function isValidSubject(mysubject,callback){
    var flag = false;
    controller.storage.subject.find({name: { $regex : new RegExp(mysubject.toString(), "i") }/*subject.toString()*/},
        function(error, subject){
            if(error){
                //return false;
            }
            console.log(subject);
            if(subject.length >0 && mysubject.toString().toLowerCase()==subject[0].name.toLowerCase()) {
                console.log('valid subject');
                flag = true;
            }

            callback(flag);
        });

}

function getTutorReview(user_id, callback)
{
  controller.storage.tutor.all(function(err,tutors)
  {
    var json_file = {}
    for(var i in tutors)
    {
      // console.log("********************");
      // console.log(tutors[i].user_id);
      // console.log(user_id);
      if(tutors[i].user_id == user_id)
        {
          // for (var j in tutor[i].reviews)
          // {

          // }
          json_file.review = tutors[i].reviews;
          
        }
    }
    // console.log(json_file);
    callback(json_file);
  });
}


function getUserForSubject(json_file, callback){
  
  // console.log(json_file);
  // console.log("++++++++++++++++++++++");
  controller.storage.user.all(function(err,users)
  {
    for(var i in users)
    {
      // console.log(users[i]._id);
      for (var j in json_file)
      {
        if(json_file[j].user_id == users[i]._id)
        {
          json_file[j].name = users[i].name;
          json_file[j].email = users[i].email;
        }
      }
    }
    // console.log(json_file);
    callback(json_file);
  });
  
}

function getTutorsForSubject(subject, callback){
    

    controller.storage.tutor.all(function(err,tutors)
  {
    //var tutorList = [];
    var json_file = {};
    //tutorList.push('Hello');
    // console.log(tutors);
    // console.log("------------------------------------");
    for(var i in tutors)
    {
      // console.log(i);

      //Iterate through all the subjects to check if that subject is in tutor list or not
      for(var j in tutors[i].subjects)
      {
        // console.log("++++++++++++++++++++++++++++");
        // console.log(j);
        //Check if that subject is taught by the tutor or not
        if (tutors[i].subjects[j].name == subject)
        {
        //  tutorList.push(tutors[i].user_id);
          // tutorList.push(tutors[i].user_id);
          
          json_temp = 
          {
            user_id : tutors[i].user_id, 
            major : tutors[i].major,
            degree : tutors[i].degree,
            summary : tutors[i].summary,
            rate : tutors[i].overall_rating
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
    getUserForSubject(json_file, function(json_file)
        {
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
            short:true,
          },
          {
            title: 'Degree',
            value: tutor.degree,
            short:true,
          },
          {
            title: 'Subjects',
            value: tutor.subject,
            short:true,
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
    debug('sendConfirmation: %o', result.data);
  }).catch((err) => {
    debug('sendConfirmation error: %o', err);
    console.error(err);
  });
};


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