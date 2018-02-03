var Botkit = require('botkit'),
    mongoStorage = require('botkit-storage-mongo')({mongoUri: 'mongodb://<seprojuser:seprojuser123@ds123728.mlab.com:23728/wolftutor', tables: ['user','tutor','subject']}),
    controller = Botkit.slackbot({
        storage: mongoStorage
    });

storage.users.all(function(error, users){
    console.log(users);
});