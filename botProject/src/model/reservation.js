const configure = require('./config');

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
  }
}
