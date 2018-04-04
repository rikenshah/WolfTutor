var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var should = chai.should();
const recommendations = require('../src/module/recommendation_algorithm.js');

describe('Recommendations', function(){
    describe('sort_tutors', function(){
        it('Should order an array of tutors by their weighted score', function(){
            var tutors = [
                { name: "Good Tutor", weightedScore: 1 },
                { name: "Bad Tutor", weightedScore: .5 },
                { name: "Mediocre Tutor", weightedScore: .75 }
            ]

            var orderedSet = recommendations.SortPeopleByAttribute(tutors, "weightedScore");

            // The first element should be the best tutor.
            expect(tutors[0].name).to.equal("Good Tutor");

            // The last element should be the worst tutor.
            expect(tutors[tutors.length-1].name).to.equal("Bad Tutor");
        });
    });

    describe('normalize_tutors', function(){
        it('Should normalize disperate values to a range within zero and 1', function(){
            let tutors = [
                { name: "Good Tutor", weightedScore: 10 },
                { name: "Bad Tutor", weightedScore: 100 },
                { name: "Mediocre Tutor", weightedScore: 50 }
            ]

            let normalizedTutors = recommendations.NormalizeAttribute(tutors, "weightedScore");

            for( let tutor of normalizedTutors ){
                expect(tutor.weightedScore).is.least(0).and.most(1);
            }
        });
    });

});
