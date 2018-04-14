const configure = require('./config');

var tutor_schema = new configure.schema({
  user_id: 'string',
  major: 'string',
  degree: 'string',
  subjects: [],
  rate: 'number',
  gpa: 'number',
  availability: [{
    day: 'string',
    from: 'number',
    to: 'number'
  }],
  summary: 'string',
  reviews: [{
    text: 'string',
      rating: 'number',
      user_id: 'string',
      date: 'date'
  }],
  overall_rating: 'number'
}, {
  collection: 'tutor'
});

var tutor = configure.mongoose.model('tutor', tutor_schema);

module.exports = {
  create_new_tutor: function(payload) {
    var nullsummary = (payload.submission.summary == null) ? "" : payload.submission.summary;
    tutor.create({
      user_id: payload.user.id,
      major: payload.submission.major,
      degree: payload.submission.degree,
      gpa: payload.submission.gpa,
      subjects: [{
        name: payload.submission.subject
      }],
      rate: payload.submission.rate,
      summary: nullsummary
    }, function(err, res) {
      if (err) return err;
      console.log('1 entry added');
    });
  },
  update_tutor: function(tutorToUpdate){
      try{

          tutor.findOneAndUpdate(
              {user_id: tutorToUpdate.user_id},
              tutorToUpdate,
              {new: true},
              function(err, res){
                if(err) throw err;
                console.log('1 entry updated');
              }
          );
      }
      catch(e){
          console.log('An error occurred when attempting to update tutor: ' + tutor.user_id);
          console.log(e.message);
          console.log(e);

          return null;
      }
  },
  add_more_subjects: function(payload) {
    // Check whether the subject already exists
    var current_subjects = payload.submission;
    console.log(current_subjects);
    var subject_list = [];
    //console.log(current_subjects);
    var subject1 = (payload.submission.subject1 == null) ? "" : payload.submission.subject1;
    if (subject1 != "") subject_list.push({
      name: subject1
    });
    var subject2 = (payload.submission.subject2 == null) ? "" : payload.submission.subject2;
    if (subject2 != "") subject_list.push({
      name: subject2
    });
    var subject3 = (payload.submission.subject3 == null) ? "" : payload.submission.subject3;
    if (subject3 != "") subject_list.push({
      name: subject3
    });
    var subject4 = (payload.submission.subject4 == null) ? "" : payload.submission.subject4;
    if (subject4 != "") subject_list.push({
      name: subject4
    });
    var subject5 = (payload.submission.subject5 == null) ? "" : payload.submission.subject5;
    if (subject5 != "") subject_list.push({
      name: subject5
    });
    //TODO Validation: If the subject is there do not add it again
    tutor.findOneAndUpdate({
      user_id: payload.user.id
    }, {
      $push: {
        subjects: {
          $each: subject_list
        }
      }
    }, function(err, res) {
      if (err) return err;
      console.log(res);
      remove_duplicate_subjects(payload.user.id);
    });
  },
  add_availability: function(payload) {
    var from_hr = payload.submission.from_time_hour;
    var from_min = payload.submission.from_time_min;
    var to_hr = payload.submission.to_time_hour;
    var to_min = payload.submission.to_time_min;
    var from_time = from_hr + from_min;
    var to_time = to_hr + to_min;
    tutor.findOneAndUpdate({
      user_id: payload.user.id
    }, {
      $push: {
        availability: {
          day: payload.submission.day1,
          from: from_time,
          to: to_time
        }
      }
    }, function(err, res) {
      if (err) return err;
      console.log(res);
    });
  },
  tutor,
  overall_rating: function (tutorid, currrent_rating) {
    tutor.findOne({user_id:tutorid},function (err,res) {
      if (err) throw err;
      var num_reviews = res.reviews.length;
      var overall_rating = res.overall_rating;
      var curr_rating = Number(currrent_rating);
      var calculate_rating = ((overall_rating*num_reviews)+curr_rating)/(num_reviews+1);
      console.log('Rating Calculation',calculate_rating);
      var new_rating = calculate_rating.toPrecision(3);
      console.log(new_rating);
      tutor.findOneAndUpdate({user_id:tutorid},{overall_rating: new_rating},function (err,resp) {
        if (err) throw err;
        console.log(resp);
      });
    });
  },
  fetch_tutor_rate: function(tutor_id,callback){
    tutor.findOne({user_id:tutor_id},function(err,res){
      if(err) return err;

      callback(null, res.rate);
    });
  } // End of function
} // End of module

function remove_duplicate_subjects(user_id){
    //console.log("Printing here");
    tutor.findOne({user_id:user_id},function (err,res) {
        if (err){
          console.log(err);
          return err;
        }
        var unique_subjects = [];
        res.subjects.forEach(function(subject){
          var flag = 0;
          unique_subjects.forEach(function(s){
            if(s.name == subject.name) flag = 1;
          });
          if(flag == 0) unique_subjects.push({name:subject.name});
        });
        //console.log("This are unique subjects");
        tutor.findOneAndUpdate({user_id:user_id},{$set: {subjects: unique_subjects}},function (err,res) {
          if (err){
            console.log(err);
            return err;
          }
          console.log(res);
        });
    });
}
