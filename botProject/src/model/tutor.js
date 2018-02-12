/* TODO

create_new_tutor
add_more_subjects
add_availability
add_review


*/


require('dotenv').config();
const mongoose = require('mongoose');

module.exports = {
  create_new_tutor : function(payload){

  },
  add_more_subjects : function(payload){

  },
  add_availability : function(payload){

  },
  add_review : function(payload){

  },
}

//mongoose.connect(process.env.MONGO_CONNECTION_STRING);

mongoose.connect(process.env.MONGO_CONNECTION_STRING, function() { /* dummy function */ })
    .then(() => {
        console.log('Connection to DB Successful');
    })
    .catch(err => { // mongoose connection error will be handled here
        console.error('App starting error:', err.stack);
        process.exit(1);
    });
var schema = mongoose.Schema;

var user_schema = new schema({name:'string',email:'string',phone: 'string',points: 'number'},{collection:'user'});
//console.log(user_schema);
var user = mongoose.model('user',user_schema);
// user.create({name:'FirstUser',email:'user1',phone: '9193334455',points: 500}, function (err,res) {
//   if(err) return err;
//   console.log('1 entry added');
// });
user.find({name:'user1'},function (err,result) {
  if (err) return err;
  console.log(result);
});
