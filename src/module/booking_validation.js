require('dotenv').config();
var mongoStorage = require('botkit-storage-mongo')(
    {
        mongoUri: process.env.MONGO_CONNECTION_STRING,
        tables: ['user', 'tutor', 'subject', 'reservation']
    });
var Botkit = require('botkit');
var controller = Botkit.slackbot(
    {
        storage: mongoStorage,
    });

function bookingValidation(userid,date,day,from,to,callback) {
    var isBookingValid=true;
    controller.storage.reservation.find({
        userid: userid,
        active: 'yes',
        date: date,
        day: day,
        from: from,
        to: to
    }, function (error, reservations) {
        if(reservations!=null && reservations.length>0)
            isBookingValid=false;
        callback(isBookingValid);
    });
}
module.exports =
    {
        bookingValidation
    };
