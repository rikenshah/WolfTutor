var Botkit = require('botkit');
var mongoStorage = require('botkit-storage-mongo')({mongoUri: process.env.MONGO_CONNECTION_STRING, tables: ['user','tutor','subject']});

var controller = Botkit.slackbot({
			        storage: mongoStorage,
    			});

controller.storage.user.all(function(err,users) {
  console.log(users)
  if (err) {
    throw new Error(err);
  }
});
