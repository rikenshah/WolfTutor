var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var should = chai.should();
const userModel = require('../src/model/user');

describe('User', function(){
  describe('get_user_info()', function(){
    it('should give user info for particular user', function(){
      var testPromise = new Promise(function (resolve,reject) {
        userModel.get_user(function(user){
          userModel.get_user_info(user.user_id,function (user) {
            resolve(user);
        });
      });
    });
      return testPromise.then(function (user) {
        expect(user.name).to.be.a('String');
      });
    });
  });

  describe('fetch_user_points()', function(){
    it('should give points of particular user', function(){
      var testPromise = new Promise(function (resolve,reject) {
        userModel.get_user(function(user){
          userModel.fetch_user_points(user.user_id,function (err,points) {
            resolve(points);
        });
      });
    });
      return testPromise.then(function (points) {
        expect(points).to.be.a('Number');
      });
    });
  });

});



