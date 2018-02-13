/* TODO

create_new_tutor - done
add_more_subjects
add_availability
add_review
*/
const configure = require('./config');


var tutor_schema = new configure.schema({
  user_id:'string',
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
    //console.log(payload);
    var nullsummary = (payload.submission.summary == null)?"": payload.submission.summary;
    tutor.create({user_id:payload.user.id,major:payload.submission.major,degree:payload.submission.degree,subjects:[{name:payload.submission.subject}],
    rate:payload.submission.rate,summary:nullsummary}, function (err,res) {
      if(err) return err;
      console.log('1 entry added');
    });
  },
  add_more_subjects : function(payload){
    // Check whether the subject already exists
    var current_subjects = payload.submission;
    //console.log(current_subjects);
    var subject1 = (payload.submission.subject1 == null)?"": payload.submission.subject1;
    var subject2 = (payload.submission.subject2 == null)?"": payload.submission.subject2;
    var subject3 = (payload.submission.subject3 == null)?"": payload.submission.subject3;
    var subject4 = (payload.submission.subject4 == null)?"": payload.submission.subject4;
    var subject5 = (payload.submission.subject5 == null)?"": payload.submission.subject5;

    tutor.findOneAndUpdate({user_id:payload.user.id},{$push: {subjects: {name: subject1}}},function (err,res) {
      if (err) return err;
      console.log(res);
    });
  },
  add_availability : function(payload){

  },
  add_review : function(payload){

  },
}
