
const configure = require('./config');

var reservation_schema =  new configure.schema({tutorid:'string',userid:'string',date:'Date',day:'string',from:'string',to:'string',active:'string'},{collection:'reservation'});
var reservation = configure.mongoose.model('reservation',reservation_schema);

module.exports = {
  get_reservation_by_user_id: function (userid, callback) {
    var current_hour = new Date().getHours().toString();
    var current_min = new Date().getMinutes().toString();
    var current_time = current_hour+current_min; // Curremt Time in 24 hr format(e.g 1420)

    reservation.find({userid:userid, active:'yes'}).
    limit(20).
    sort({date: -1}).
    exec(function (err,reservations) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, reservations);
    }
  });
}
}
