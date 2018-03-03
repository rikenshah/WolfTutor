const configure = require('./config');
var subject_schema = new configure.schema({
  name: 'string'
}, {
  collection: 'subject'
});
var subject = configure.mongoose.model('subject', subject_schema);

module.exports = {
  // return the list of all subjects
  get_all_subjects: function(callback) {
    subject.find({}, '-_id name', function(err, res) {
      if (err) return err;
      callback(res);
    });
  }
}

