const configure = require('./config');
const async = require('async');

var tutor_schema = new configure.schema({
  user_id:{
    type: 'string',
    unique: true
  },
  major:'string',
  degree:'string',
  subjects:[],
  rate:'number',
  availability: [{
    day:'string',
    from:'number',
    to:'number'
  }],
  summary:'string',
  review: [{
    text:'string',
    rating:'number'
  }],
  overall_rating:'number'
  },{collection:'tutor'});

var tutor = configure.mongoose.model('tutor',tutor_schema);

module.exports = {
  create_new_tutor : function(payload){
    var nullsummary = (payload.submission.summary == null)?"": payload.submission.summary;
    tutor.create({user_id:payload.user.id,major:payload.submission.major,degree:payload.submission.degree,subjects:[{name:payload.submission.subject}],
    rate:payload.submission.rate,summary:nullsummary}, function (err,res) {
      if(err){
        console.log("user already exists");
        console.log(err);
        return err;
      }console.log('1 entry added');
    });
  },
  add_more_subjects : function(payload){
    // Check whether the subject already exists
    var current_subjects = payload.submission;
    console.log(current_subjects);
    var subject_list = [];
    //console.log(current_subjects);
    var subject1 = (payload.submission.subject1 == null)?"": payload.submission.subject1;
    if (subject1 != "") subject_list.push({name:subject1});
    var subject2 = (payload.submission.subject2 == null)?"": payload.submission.subject2;
    if (subject2 != "") subject_list.push({name:subject2});
    var subject3 = (payload.submission.subject3 == null)?"": payload.submission.subject3;
    if (subject3 != "") subject_list.push({name:subject3});
    var subject4 = (payload.submission.subject4 == null)?"": payload.submission.subject4;
    if (subject4 != "") subject_list.push({name:subject4});
    var subject5 = (payload.submission.subject5 == null)?"": payload.submission.subject5;
    if (subject5 != "") subject_list.push({name:subject5});
    remove_duplicates(subject_list);
    tutor.findOneAndUpdate({user_id:payload.user.id},{$push: {subjects: {$each:subject_list}}},function (err,res) {
      if (err) return err;
      console.log(res);
      remove_duplicates(payload.user.id);
    });
  },
  add_availability : function(payload){
    var from_hr  = payload.submission.from_time_hour;
    var from_min = payload.submission.from_time_min;
    var to_hr  = payload.submission.to_time_hour;
    var to_min = payload.submission.to_time_min;
    var from_time = from_hr+from_min;
    var to_time = to_hr+to_min;
    tutor.findOneAndUpdate({user_id:payload.user.id},{$push: {availability: {day:payload.submission.day1,from:from_time,to:to_time}}},function (err,res) {
      if (err) return err;
      console.log(res);
    });
  },
  add_review : function(payload){
    // TODO Calculate the overall rating (Sum of all the ratings by number of rating)
    console.log(payload);
    tutor.findOneAndUpdate({user_id:payload.user.id},{$push: {review: {text:payload.submission.review,rating:payload.submission.rating}}},function (err,res) {
      if (err) return err;
      console.log(res);
    });
  }
}

function remove_duplicates(user_id){
    tutor.findOne({user_id:user_id},function (err,res) {
        if (err) return err;
        var unique_subjects = [];
        console.log("Printing here");
        res.subjects.forEach(function(subject){
          var flag = 0;
          unique_subjects.forEach(function(s){
            if(s.name == subject.name) flag = 1;
          });
          if(flag == 0) unique_subjects.push({name:subject.name});
        });
        console.log(unique_subjects);
        tutor.findOneAndUpdate
    });
}
