const axios = require('axios');
const debug = require('debug')('slash-command-template:tutor');
const qs = require('querystring');
const users = require('./users');

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
        title: `tutor created for ${tutor.userEmail}`,
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

// Create tutor. Call users.find to get the user's email address
// from their user ID
const create = (userId, submission) => {
  const tutor = {};
  const fetchUserEmail = new Promise((resolve, reject) => {
    users.find(userId).then((result) => {
      debug(`Find user: ${userId}`);
      resolve(result.data.user.profile.email);
    }).catch((err) => { reject(err); });
  });
// ##################### Fetch User name as well, result.data.user.profile.real_name

  fetchUserEmail.then((result) => {
    tutor.userId = userId;
    tutor.userEmail = result;
    tutor.major = submission.major;
    tutor.degree = submission.degree;
    tutor.subject = submission.subject;
    tutor.rate = submission.rate;
    tutor.summary = submission.summary;
    sendConfirmation(tutor);
    console.log(tutor);
    return tutor;
  }).catch((err) => { console.error(err); });
};

module.exports = { create, sendConfirmation };
