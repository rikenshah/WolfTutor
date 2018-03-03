var assert = require("assert"); // node.js core module
const subjectsModel = require('../src/model/subject');



describe('Subject', function(){
  describe('get_all_subjects()', function(){
    it('should should extract all subjects from the database', function(){
      var testPromise = new Promise(function (resolve,reject) {
        subjectsModel.get_all_subjects(function (subjects) {
          resolve(subjects);
      });
    });

      return testPromise.then(function (subjects) {
        console.log(subjects);
      });

      //assert.equal(-1, [1,2,3].indexOf(4)); // 4 is not present in this array so indexOf returns -1
    });
  });
});
