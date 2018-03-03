require('dotenv').config();
const axios = require('axios');
const debug = require('debug')('slash-command-template:tutor');
const qs = require('querystring');
const users = require('./users');
const MongoClient = require('mongodb').MongoClient;
const UserModel = require('./model/user');
var url = process.env.MONGO_CONNECTION_STRING;
var mongoStorage = require('botkit-storage-mongo')({mongoUri: process.env.MONGO_CONNECTION_STRING, tables: ['user','tutor','subject']});
var Botkit = require('botkit');
var controller = Botkit.slackbot({
    storage: mongoStorage,
});

// Uncomment the lines below to test the connection with the database
// MongoClient.connect(url, function (err) {
//     if (err) throw err;
//     console.log('Connection to the Database Successful');
// });

/*
 *  Send tutor creation confirmation via
 *  chat.postMessage to the user who created it
 */
const sendConfirmation = (tutor) => {
  axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: tutor.userId,
    text: 'Tutor created!',
    attachments: JSON.stringify([
      {
        title: `Tutor profile created for ${tutor.userName}`,
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

// Create tutor. Call users.find to get the user's email address
// from their user ID
const create = (userId, submission) => {
  const tutor = {};
  const fetchUserEmail = new Promise((resolve, reject) => {
    users.find(userId).then((result) => {
      debug(`Find user: ${userId}`);
      resolve(result.data.user.profile);
      //console.log(result.data.user.profile.real_name);
    }).catch((err) => { reject(err); });
  });
  fetchUserEmail.then((result) => {
    tutor.userId = userId;
    tutor.userName = result.real_name;
    tutor.userEmail = result.email;
    tutor.major = submission.major;
    tutor.degree = submission.degree;
    tutor.subject = submission.subject;
    tutor.rate = submission.rate;
    tutor.summary = submission.summary;
    sendConfirmation(tutor);
    console.log(tutor);
    // //console.log(result);
    // MongoClient.connect(url, function (err, db) {
    //     if(err) throw err;
    //     var dbo = db.db("wolftutor");
    //     dbo.collection("testtutors").insertOne(tutor, function(err, res) {
    //     if (err) throw err;
    //     console.log("1 Tutor inserted");
    //     db.close();
    //   });
    // });
    //controller.s


    //return tutor;
  }).catch((err) => { console.error(err); });
};


const new_user = (userId, submission) => {
  const tutor = {};
  const fetchUserEmail = new Promise((resolve, reject) => {
    users.find(userId).then((result) => {
      debug(`Find user: ${userId}`);
      resolve(result.data.user.profile);
      //console.log(result.data.user.profile.real_name);
    }).catch((err) => { reject(err); });
  });
  fetchUserEmail.then((result) => {
    tutor.user_id = userId;
    // tutor.name = result.real_name;
    tutor.name = result.real_name;
    tutor.email = result.email;
    tutor.phone = result.phone;
    // console.log(tutor);
    valid_user(tutor, function(flag)
    {
      if(flag == 0)
      {
        console.log("User Name already exist");
      }
      else
      {
        console.log("Added User");
        // Uncomment this and at top constant
        UserModel.create_new_user(tutor);

      }
    });

    console.log(tutor);
  }).catch((err) => { console.error(err); });
};

function valid_user(tutor, callback)
{
  var flag = -1;
  controller.storage.user.all(function(err,users)
  {
    for(var i in users)
    {
      // console.log(users[i].name);
      // console.log(tutor.name);
      if(tutor.name == users[i].name)
        {
          console.log("In if");
          flag = 0;
        }
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


function getTutorsForSubject(subject,slackUserName, callback) {
    controller.storage.tutor.all(function (err, tutors) {
        var json_file = {};

        for (var i in tutors) {

            if(tutors[i].user_id==slackUserName) {
                continue;
            }

            for (var j in tutors[i].subjects) {

                if (tutors[i].subjects[j].name.toLowerCase() == subject.toLowerCase()) {
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

        getUserForSubject(json_file, function (json_file) {
            callback(json_file);
        });
    });

}

module.exports = { create, sendConfirmation, new_user, getTutorReview, getTutorsForSubject };
