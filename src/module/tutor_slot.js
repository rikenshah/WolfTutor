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

function getAvailableSlotsTutor(tutorId, userId, callback) 
{


    controller.storage.tutor.find(
    {
        user_id: tutorId
    }, function(error, tutor) 
    {

        if (tutor == null || tutor.length == 0) 
        {
            console.log('No Tutors found');
            return;
        } 
        else
            var avl = tutor[0].availability;

        //**get availabilities of the tutor for the tutee

        var currentDate = new Date();
        var currentDay = currentDate.getDay();
        var currentDateOnly = currentDate.getDate()

        var dayMap = {};
        dayMap[0] = {day: 'Sunday'};
        dayMap[1] = {day: 'Monday'};
        dayMap[2] = {day: 'Tuesday'};
        dayMap[3] = {day: 'Wednesday'};
        dayMap[4] = {day: 'Thursday'};
        dayMap[5] = {day: 'Friday'};
        dayMap[6] = {day: 'Saturday'};

        var dayNumMap = {};
        dayNumMap['Sunday'] = {day: '0'};
        dayNumMap['Monday'] = {day: '1'};
        dayNumMap['Tuesday'] = {day: '2'};
        dayNumMap['Wednesday'] = {day: '3'};
        dayNumMap['Thursday'] = {day: '4'};
        dayNumMap['Friday'] = {day: '5'};
        dayNumMap['Saturday'] = {day: '6'};

        var reservationSlots = {};

        for (var i in avl) 
        {
            var availableDay = avl[i].day;
            var availableDaykey = dayNumMap[availableDay];
            var availabeDayVal; //Corresponding numeric value

            for (var v in availableDaykey) 
            {
                if (v == 'day')
                    availabeDayVal = availableDaykey[v];
            }

            var numberOfDays = (currentDay == availabeDayVal)?7:(Number(7 - currentDay) + Number(availabeDayVal)) % 7;

            //if(currentDay === availabeDayVal)
              //  numberOfDays=7;

            //console.log('no of days is '+numberOfDays+'current day '+currentDay+' available day'+availabeDayVal);
           /* const noOfDays=new Promise((resolve,reject) => {
                var test = (currentDay == availabeDayVal)?7:(Number(7 - currentDay) + Number(availabeDayVal)) % 7;
                resolve(test);
            });

            noOfDays.then((result) => {
                console.log('result is '+result);
            });*/
            var futureDay = dayMap[availabeDayVal].day;

            var futureDate = new Date();

            futureDate.setDate(futureDate.getDate() + numberOfDays);

            futureDate.setHours(0, 0, 0, 0);


            //TODO same day availability
            if (availabeDayVal == currentDay) 
            {
                /*if(futureDate.

                    ()>)*/
            }


            for (j = Number(avl[i].from); j < Number(avl[i].to);) 
            {
                var startTime = j.toString();
                var endTime = '';
                if (startTime.includes('00', 2) || startTime.includes('00', 1)) 
                {
                    endTime = Number(j + 30).toString();
                    j = j + 30;
                } 
                else 
                {
                    endTime = Number(j + 70).toString();
                    j = j + 70;
                }

                if (startTime.length == 3)
                    startTime = '0' + startTime;
                if (endTime.length == 3)
                    endTime = '0' + endTime;


                //saving 30 minutes reservation slots
                var futureReservationTimeStamp = futureDate.getFullYear() + '' + futureDate.getMonth() + '' +
                    futureDate.getDate() + '' + futureDay + '' + startTime + '' + endTime;

                reservationSlots[futureReservationTimeStamp] = {
                    Date: futureDate,
                    Day: futureDay,
                    from: startTime,
                    to: endTime,
                    available: 'yes'
                };
            }
        }

        /*Getting existing reservations*/
        controller.storage.reservation.find({
            tutorid: tutorId,
            active: 'yes'
        }, function(error, reservations)
        {

            if (reservations.length > 0)
            {
                for (var i in reservations)
                {
                    //TODO mark reservations as active:'No' when a user reviews an old reservation

                    var reservationDay = new Date(reservations[i].date.toString());

                    var existingReservationTimeStamp = reservationDay.getFullYear() + '' + reservationDay.getMonth() + '' +
                        reservationDay.getDate() + '' + reservations[i].day + '' + reservations[i].from + '' +
                        reservations[i].to;


                    if (reservationSlots[existingReservationTimeStamp] != null) {
                        reservationSlots[existingReservationTimeStamp].available = 'No';
                    }

                }

            }

            callback(reservationSlots);
        });


    });
}

module.exports = 
{
    getAvailableSlotsTutor
};

