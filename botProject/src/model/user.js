
const configure = require('./config');
const reservationModel = require('./reservation')

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
        console.log(reservations);
        if (reservations.length == 0) {
          console.log('No reservations');
        } else {
          var date_of_first = reservations[0].date;
          var today_reservations = [];
          today_reservations.push(reservations[0]);
          //console.log(today_reservations);
          console.log(reservations.length);
          for (var i in reservations) {
            if (date_of_first != reservations[i].date) {
              console.log('Different dates');
            } else {
              today_reservations.push(reservations[i]);
            }
          }
        }
      }
    });

  }
}
