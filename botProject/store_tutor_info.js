var Botkit = require('botkit');
var mongoStorage = require('botkit-storage-mongo')({mongoUri: 'mongodb://seprojuser:seprojuser123@ds123728.mlab.com:23728/wolftutor', tables: ['user','tutor','subject']});

var controller = Botkit.slackbot({
			        storage: mongoStorage,
    			},print_users);

exports.controller = controller

function print_users() {
	var beans = {id: 'cool', beans: ['pinto', 'garbanzo']};
	controller.storage.user.save(beans);
}

controller.storage.user.all(function(err,users) {

  console.log(users)

  if (err) {
    throw new Error(err);
  }
});