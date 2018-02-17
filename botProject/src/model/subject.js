/* TODO
get_all_subjects
*/
const configure = require('./config');
var subject_schema =  new configure.schema({name:'string'},{collection:'subject'});
var subject = configure.mongoose.model('subject',subject_schema);

module.exports = {
  get_all_subjects: function(){
    subject.find({},'-_id name',function (err,res) {
      if (err) return err;
      //console.log(res);
    });
  }
}
