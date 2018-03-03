const configure = require('./config');
const reservationModel = require('./reservation');
const action = require('../module/action');
const TutorModel = require('./tutor.js');

var user_schema = new configure.schema({
  user_id: 'string',
  name: 'string',
  email: 'string',
  phone: 'string',
  points: 'number'
}, {
  collection: 'user'
});
var user = configure.mongoose.model('user', user_schema);

module.exports = {
  // Creates a new user when a user uses the system for the first time
  create_new_user: function(payload) {
    console.log(payload);
    user.create({
      user_id: payload.user_id,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      points: 100
    }, function(err, res) {
      if (err) return err;
      console.log('1 entry added');
    });
  },
  get_user_info: function(user_id,callback){
  	user.findOne({user_id:user_id},function(err,user){
  		if(err){
  			console.log(err);
  			return err;
  		}
  		callback(user);
  	});
  },
  fetch_user_points: function(user_id,callback){
    user.findOne({user_id:user_id},function(err,user){
      if(err){
        console.log(err);
        return err;
      }
      callback(null,user.points);
    });
  }, //End of function
  // This function will be executed when a user gives review for his session
  give_review: function(payload) {
    console.log(payload);
    reservationModel.get_reservation_by_user_id(payload.user.id, function(err, reservations) {
      if (err) {
        console.log(err);
      } else {
        // Check if there are no reservations for that user
        if (reservations.length == 0) {
          console.log('No reservations');
          action.send_message(payload.channel.id, 'Sorry, you don\'t have any sessions to review', []);
        } else {
          var current_date = new Date();
          var current_hour = current_date.getHours().toString();
          var current_min = current_date.getMinutes().toString();
          var current_time = current_hour + current_min; // Curremt Time in 24 hr format(e.g 1420)
          var today = new Date(current_date.getFullYear(), current_date.getMonth(), current_date.getDate(), 0, 0, 0);
          var today_reservations = [];
          // Iterate through the reservation list and check if there are any reservations today
          // and add them to the today reservation list
          for (var i in reservations) {
            if (reservations[i].date - today == 0) {
              if (current_time > reservations[i].to) {
                today_reservations.push(reservations[i]);
              }
            } else {
              console.log('Different Dates');
            }
          }
          // Check if there are no reservations for that user today
          if (today_reservations.length == 0) {
            action.send_message(payload.channel.id, 'Sorry, you don\'t have any sessions to review', []);
          } else {
            today_reservations.sort(function(a, b) {
              var num_a = Number(a.to);
              var num_b = Number(b.to);
              return num_b - num_a;
            });
            tutor_id = today_reservations[0].tutorid;
            // Enter the reviews in that particular tutor
            TutorModel.tutor.findOneAndUpdate({
              user_id: tutor_id
            }, {
              $push: {
                reviews: {
                  text: payload.submission.review,
                  rating: payload.submission.rating
                }
              }
            }, function(err, res) {
              if (err) return err;
            });
            // Set the active flag from yes to no
            reservationModel.set_inactive(today_reservations[0]);
            // Udate overall rating
            TutorModel.overall_rating(today_reservations[0].tutorid,payload.submission.rating);
          }
        }
      }
    });
  }, // End of function
  update_booking_points: function(user_id, tutor_id,points){
    console.log('Ids are ');
    console.log(user_id);
    console.log(tutor_id);
    console.log(points);
    module.exports.fetch_user_points(user_id,function(err,user_points){
      if(err){
        console.log(err);
        return err;
      }
      console.log('In Update Booking',user_points);
      user.findOneAndUpdate({user_id:user_id},{$set: {points: (user_points-points)}},function(err,user){
        if(err){
          console.log(err);
          return err;
        }
        console.log("User points updated to :"+(user_points-points));
      });
    });
    module.exports.fetch_user_points(tutor_id,function(err,tutor_points){
      if(err){
        console.log(err);
        return err;
      }
      user.findOneAndUpdate({user_id:tutor_id},{$set: {points: (tutor_points+points)}},function(err,user){
        if(err){
          console.log(err);
          return err;
        }
        console.log("Tutor points updated to :"+(tutor_points+points));
      });
    });
  }, // End of function
  send_tutor_notification: function(user_id, tutor_id, date, day, from, to){
  // send_tutor_notification(){
    // var student_name = "Rikne";
    // var student_phone = "1919191991";
    // var student_email = "rshah9@ncsu.edu";
    // var tutor_id = "U93ELGP8S"
    // var user_id = "U8XDVJD26";
    // var from = "csdcd";
    // var to = "cdscds";
    // var date = "Cdcdsdc";
    // var day = "cdcdsd";
    module.exports.get_user_info(user_id, function(user){
      console.log("sending notification");
      var student_name = user.name;
      var student_email = user.email;
      var student_phone = user.phone;
      action.send_message(tutor_id,"Voila, a student has booked you for the tutoring session.",[
              {
                  "fields":
                  [
                   {
                      "title": 'Student Name',
                      "value": student_name,
                      "short":true,
                    },
                    {
                      "title": 'Email',
                      "value": student_email,
                      "short":true,
                    },
                    {
                      "title": 'Phone',
                      "value": student_phone,
                      "short":true,
                    },
                    {
                      "title": 'Date',
                      "value": date,
                      "short":true,
                    },
                    {
                      "title": 'Day',
                      "value": day,
                      "short":true,
                    },
                    {
                      "title": 'From',
                      "value": from,
                      "short":true,
                    },
                    {
                      "title": 'To',
                      "value": to,
                      "short":true,
                    }
                  ]
              }
          ]);
    }); // End of query
  }// End of function
} //End of module
