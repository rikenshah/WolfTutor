require('dotenv').config();
var mongoStorage = require('botkit-storage-mongo')({mongoUri: process.env.MONGO_CONNECTION_STRING, tables: ['user','tutor','subject']});
var Botkit = require('botkit');
var controller = Botkit.slackbot({
    storage: mongoStorage,
});

function isValidSubject(mysubject, callback) {
    var flag = false;
    controller.storage.subject.find({name: {$regex: new RegExp(mysubject.toString(), "i")}/*subject.toString()*/},
        function (error, subject) {
            if (error) {
                //return false;
            }
            //console.log(subject);
            var tuteeSubject=mysubject;
            var givenSubject=subject[0].name.toString().toLowerCase();
            if (subject.length > 0 && (tuteeSubject.toLowerCase() === givenSubject)) {
               // console.log('valid subject');
                flag = true;
            }

            callback(flag);
        });

}

module.exports = { isValidSubject };