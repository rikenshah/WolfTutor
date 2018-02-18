
const configure = require('./config');
const reservationModel = require('./reservation');
const action = require('../action');
const TutorModel = require('./tutor.js');

var user_schema =  new configure.schema({user_id:'string',name:'string',email:'string',phone: 'string',points: 'number'},{collection:'user'});
var user = configure.mongoose.model('user',user_schema);

module.exports = {
  create_new_user: function(payload){
    console.log(payload);
    user.create({user_id:payload.user_id,name:payload.name,email:payload.email,phone:payload.phone,points:100}, function (err,res) {
      if(err) return err;
      console.log('1 entry added');
    });
  },
  add_review: function (payload) {
    console.log(payload);
    reservationModel.get_reservation_by_user_id(payload.user.id, function (err, reservations) {
      if (err) {
        console.log(err);
      } else {
        //console.log(reservations);
        if (reservations.length == 0) {
          console.log('No reservations');
          action.send_message(payload.channel.id,'Sorry, you don\'t have any sessions to review',[]);
        } else {
          var current_date = new Date();
          var current_hour = current_date.getHours().toString();
          var current_min = current_date.getMinutes().toString();
          var current_time = current_hour+current_min; // Curremt Time in 24 hr format(e.g 1420)
          var today = new Date(current_date.getFullYear(),current_date.getMonth(),current_date.getDate(),0,0,0);
          var date_of_first = reservations[0].date;
          var today_reservations = [];
          for (var i in reservations) {
            if (date_of_first - today == 0) {
              if(current_time > reservations[i].to) {
                  today_reservations.push(reservations[i]);
              }
            } else {
              console.log('Different Dates');
            }
          }
          if(today_reservations.length == 0){
            action.send_message(payload.channel.id,'Sorry, you don\'t have any sessions to review',[]);  
          }
          today_reservations.sort(function (a,b) {
            var num_a = Number(a.to);
            var num_b = Number(b.to);
            return num_b - num_a;
          });
          tutor_id = today_reservations[0].tutorid;
          TutorModel.tutor.findOneAndUpdate({user_id:payload.user.id},{$push: {review: {text:payload.submission.review,rating:payload.submission.rating}}},function (err,res) {
            if (err) return err;
            console.log(res);
          });
      }
    }
    });
  },
}
