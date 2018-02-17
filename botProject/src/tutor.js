require('dotenv').config();
const axios = require('axios');
const debug = require('debug')('slash-command-template:tutor');
const qs = require('querystring');
const users = require('./users');
const MongoClient = require('mongodb').MongoClient;
// const UserModel = require('./model/user');
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
        // UserModel.create_new_user(tutor);

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

module.exports = { create, sendConfirmation, new_user };
