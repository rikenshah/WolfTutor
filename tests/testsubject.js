var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var should = chai.should();
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
        expect(subjects).to.be.a('Array');
        subjects[0].should.have.property('name');
      });
    });
  });
});
