const configure = require('./config');
const TutorModel = require('./tutor');
const UserModel = require('./user')

var reservation_schema = new configure.schema({
  tutorid: 'string',
  userid: 'string',
  date: 'Date',
  day: 'string',
  from: 'string',
  to: 'string',
  active: 'string'
}, {
  collection: 'reservation'
});
var reservation = configure.mongoose.model('reservation', reservation_schema);

module.exports = {
  // Returns all the active reservations of that user
  get_reservation_by_user_id: function(userid, callback) {
    reservation.find({
      userid: userid,
      active: 'yes'
    }).
    limit(20).
    sort({
      date: -1
    }).
    exec(function(err, reservations) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, reservations);
      }
    });
  },
  set_inactive: function(payload) {
    // Set active from yes to no when review is added
    reservation.findByIdAndUpdate(payload.id, {
      active: 'no'
    }, function(err, res) {
      if (err) throw err;
      console.log('1 Entry Updated');
    });
  },
  update_booking_points: function(user_id, tutor_id,points){
    UserModel.fetch_user_points(user_id,function(user_points){    
      UserModel.findOneAndUpdate({user_id:user_id},{$set: {points: user_points-points}},function(err,user){
        if(err){
          console.log(err);
          return err;
        }
        Console.log("User points updated to :"+user_points-points);
      });
    });
    UserModel.fetch_user_points(tutor_id,function(tutor_points){
      UserModel.findOneAndUpdate({user_id:tutor_id},{$set: {points: tutor_points-points}},function(err,user){
        if(err){
          console.log(err);
          return err;
        }
        Console.log("Tutor points updated to :"+(tutor_points+points));
      });
    });
  } // End of function
}// End of Module
