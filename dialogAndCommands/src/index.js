require('dotenv').config();

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const tutor = require('./tutor');
const debug = require('debug')('slash-command-template:index');

const app = express();

/*
 * Parse application/x-www-form-urlencoded && application/json
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('<h2>The Slash Command and Dialog app is running</h2> <p>Follow the' +
  ' instructions in the README to configure the Slack App and your environment variables.</p>');
});

/*
 * Endpoint to receive /wolftutor slash command from Slack.
 * Checks verification token and opens a dialog to capture more info.
 */
app.post('/wolftutor', (req, res) => {
  // extract the verification token, slash command text,
  // and trigger ID from payload
  const { token, text, trigger_id } = req.body;
  // check that the verification token matches expected value
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
    // create the dialog payload - includes the dialog structure, Slack API token,
    // and trigger ID
    const dialog = {
      token: process.env.SLACK_ACCESS_TOKEN,
      trigger_id,
      dialog: JSON.stringify({
        title: 'Become a Tutor',
        callback_id: 'submit-tutor',
        submit_label: 'Submit',
        elements: [
          {
            label: 'Major',
            type: 'select',
            name: 'major',
            options: [
              { label: 'Computer Science', value: 'Computer Science' },
              { label: 'Computer Engineering', value: 'Computer Engineering' },
              { label: 'Electrical Engineering', value: 'Electrical Engineering' },
              { label: 'Mechanical Engineering', value: 'Mechanical Engineering' },
              { label: 'Chemical Engineering', value: 'Chemical Engineering' },
            ],
          },
          {
            label: 'Degree',
            type: 'select',
            name: 'degree',
            options: [
              { label: 'Bachelors', value: 'Bachelors' },
              { label: 'Masters', value: 'Masters' },
              { label: 'Associate', value: 'Associate' },
              { label: 'High School GED', value: 'High School GED' },
            ],
          },
          {
            label: 'Subjects',
            type: 'select',
            name: 'subject',
            options: [
              { label: 'Operating Systems', value: 'Operating Systems' },
              { label: 'Algorithms', value: 'Algorithms' },
              { label: 'Software Engineering', value: 'Software Engineering' },
              { label: 'Processor Design', value: 'Processor Design' },
            ],
          },
          {
            label: 'Rate',
            type: 'text',
            subtype: 'number',
            name: 'rate',
            hint: 'If you want to tutor for free then type 0 above',
          },
          // {
          //   label: 'Availability',
          //   type: 'select',
          //   name: 'availability',
          //   options: [
          //     { label: 'Monday', value: 'Monday' },
          //     { label: 'Tuesday', value: 'Tuesday' },
          //     { label: 'Wednesday', value: 'Wednesday' },
          //     { label: 'Thursday', value: 'Thursday' },
          //     {label: 'Friday', value: 'Friday'},
          //     {label: 'Saturday', value: 'Saturday'},
          //     {label: 'Sunday', value: 'Saturday'},
          //   ],
          // },

          {
            label: 'Summary',
            type: 'textarea',
            name: 'summary',
            optional: true,
          },
        ],
      }),
    };

    // open the dialog by calling dialogs.open method and sending the payload
    axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog))
      .then((result) => {
        debug('dialog.open: %o', result.data);
        console.log("Dialog Opened sucessful");
        res.send('');
      }).catch((err) => {
        debug('dialog.open call failed: %o', err);
        res.sendStatus(500);
      });
  } else {
    debug('Verification token mismatch');
    console.log('Failed Here');
    res.sendStatus(403);
  }
});

/*
 * Endpoint to receive the dialog submission. Checks the verification token
 * and creates a Helpdesk tutor
 */
app.post('/interactive-component', (req, res) => {
  const body = JSON.parse(req.body.payload);

  // check that the verification token matches expected value
  if (body.token === process.env.SLACK_VERIFICATION_TOKEN) {
    debug(`Form submission received: ${body.submission.trigger_id}`);

    // immediately respond with a empty 200 response to let
    // Slack know the command was received
    res.send('');

    // create tutor
    tutor.create(body.user.id, body.submission);
  } else {
    debug('Token mismatch');
    res.sendStatus(500);
  }
});

app.post('/botactivity', (req, res) => {
  console.log(req['body']['event']['text']);
  res.send("I am here");
});


app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}!`);
});
