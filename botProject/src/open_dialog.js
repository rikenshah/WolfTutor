const axios = require('axios');
const debug = require('debug')('botProject:src/slack_bot');
const qs = require('querystring');

module.exports = {
  open_dialog: function(dialog,res) {
    axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog))
      .then((result) => {
        debug('dialog.open: %o', result.data);
        console.log("Dialog Opened sucessful");
        res.send('');
      }).catch((err) => {
        debug('dialog.open call failed: %o', err);
        res.sendStatus(500);
      });
  }
}
