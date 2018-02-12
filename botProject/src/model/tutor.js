/* TODO

create_new_tutor
add_more_subjects
add_availability
add_review


*/


require('dotenv').config();
const mongoose = require('mongoose');
const config = require('./config');
mongoose.connect(process.env.MONGO_CONNECTION_STRING, function() { /* dummy function */ })
    .then(() => {
        console.log('Connection to DB Successful');
    })
    .catch(err => { // mongoose connection error will be handled here
        console.error('App starting error:', err.stack);
        process.exit(1);
    });
var schema = mongoose.Schema;
var tutor_schema = new schema({
  user_id:'string',
  major:'string',
  degree:'string',
  subjects:[{
    name:'string'
  }],
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
var tutor = mongoose.model('tutor',tutor_schema);
module.exports = {
  create_new_tutor : function(payload){
    console.log(payload);
    var nullsummary = (payload.submission.summary == null)?"": payload.submission.summary;
    tutor.create({user_id:payload.user.id,major:payload.submission.major,degree:payload.submission.degree,subjects:[{name:payload.submission.subject}],
    rate:payload.submission.rate,summary:nullsummary}, function (err,res) {
      if(err) return err;
      console.log('1 entry added');
    });
  },
  add_more_subjects : function(payload){

  },
  add_availability : function(payload){

  },
  add_review : function(payload){

  },
}


//console.log(user_schema);
//var user = mongoose.model('user',user_schema);
//
// user.find({name:'user1'},function (err,result) {
//   if (err) return err;
//   console.log(result);
// });
