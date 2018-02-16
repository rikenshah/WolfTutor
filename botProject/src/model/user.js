
const configure = require('./config');

var user_schema =  new configure.schema({name:'string',email:'string',phone: 'string',points: 'number'},{collection:'user'});
var user = configure.mongoose.model('user',user_schema);
module.exports = {
  create_new_user: function(payload){
    console.log(payload);
    user.create({name:'xyz',email:'test12@ncsu.edu',phone:'',points:100}, function (err,res) {
      if(err) return err;
      console.log('1 entry added');
    });
  },
}
