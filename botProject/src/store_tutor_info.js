var Botkit = require('botkit');
var mongoStorage = require('botkit-storage-mongo')({mongoUri: 'mongodb://seprojuser:seprojuser123@ds123728.mlab.com:23728/wolftutor', tables: ['user','tutor','subject']});

var controller = Botkit.slackbot({
			        storage: mongoStorage,
    			});

controller.storage.user.all(function(err,users) {
  console.log(users)
  if (err) {
    throw new Error(err);
  }
});