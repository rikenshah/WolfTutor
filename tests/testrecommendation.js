var fs = require('fs');
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
            ];

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
            ];

            let normalizedTutors = recommendations.NormalizeAttribute(tutors, "weightedScore");

            for( let tutor of normalizedTutors ){
                expect(tutor.weightedScore).is.least(0).and.most(1);
            }
        });
    });

    describe('Get individual score', function(){
        it('Should calculate an individual score', function(){
            let tutor = {
                name: "Good Tutor",
                reviews: [
                    { user_id: 1, rating: 3 },
                    { user_id: 1, rating: 1 },
                    { user_id: 2, rating: 5 },
                    { user_id: 2, rating: 5 },
                    { user_id: 2, rating: 5 },
                    { user_id: 2, rating: 5 },
                    { user_id: 2, rating: 5 },
                    { user_id: 2, rating: 5 },
                    { user_id: 2, rating: 5 },
                    { user_id: 2, rating: 5 },
                    { user_id: 2, rating: 5 },
                    { user_id: 2, rating: 5 }
                ]
            };

            let student = {
                id: 1
            };

            let score = recommendations.GetIndividualScore(tutor, student);

            expect(score).to.equal(2);
        });
    });


    describe('Get overall score', function(){
        it('Should calculate an overall score', function(){
            let tutor = {
                name: "Good Tutor",
                reviews: [
                    { user_id: 1, rating: 1 },
                    { user_id: 2, rating: 3 },
                    { user_id: 2, rating: 5 },
                ]
            };

            let score = recommendations.GetOverallScore(tutor);

            expect(score).to.equal(3);
        });
    });

    describe('Make reecommendations', function(){
        it('Make recommendations based on the reviews of a set of students', function(){
            let tutors = [
                {
                    name: "Good Tutor",
                    reviews: [
                        { user_id: 1, rating: 3 },
                        { user_id: 2, rating: 4 },
                        { user_id: 2, rating: 5 },
                    ]
                },
                {
                    name: "Bad Tutor",
                    reviews: [
                        { user_id: 1, rating: 1 },
                        { user_id: 2, rating: 1 },
                        { user_id: 2, rating: 1 },
                    ]
                },
                {
                    name: "Mediocre Tutor",
                    reviews: [
                        { user_id: 1, rating: 3 },
                        { user_id: 2, rating: 3 },
                        { user_id: 2, rating: 3 },
                    ]
                },
                {
                    name: "New Tutor",
                    reviews: [
                    ]
                },
            ];

            let currentUser = {
                id: 1,
                reviews: [
                    { user_id: 1, rating: 1 },
                    { user_id: 2, rating: 3 },
                    { user_id: 2, rating: 5 },
                ]
            };

            let orderedSet = recommendations.Prioritize(tutors, currentUser);

            // The first element should be the best tutor.
            expect(tutors[0].name).to.equal("Good Tutor");

            // The last element should be the worst tutor.
            expect(tutors[tutors.length-1].name).to.equal("Bad Tutor");
        });
    });

    describe('Test usefulness', function(){
        it('given a set of tutors and students, the recommendations should be useful', function(){
            // TODO: load students
            // TODO: load tutors
            let students = JSON.parse(fs.readFileSync(__dirname + '/userlist.json', 'utf8'));
            let tutors =  JSON.parse(fs.readFileSync(__dirname + '/tutorlist.json', 'utf8'));

            let predictedTutors_gpa = [];
            let predictedTutors_rating = [];
            // gpa test
            let weights1 = { "individual":0, "overall": 0, "previous": 0, "gpa": 1};
            for( let s of students ) {
                let rec = recommendations.Prioritize(tutors, s, weights1);
                let top10 = rec.slice(0, 20);

                for(let t of top10){
                    let a = {
                        "weightedScore": t.weightedScore,
                        "individualScore": t.individualScore,
                        "overallScore": t.overallScore,
                        "previousInteractionScore": t.previousInteractionScore,
                        "gpaScore": t.gpaScore
                    };
                    predictedTutors_gpa.push(a);
                }
            }

            fs.writeFile('gpa_data.json',JSON.stringify(predictedTutors_gpa),function(err){
                if(err) throw err;
            });

            // let weights2 = {individual:0, overall: 10, previous: 0, gpa: 0};
            // for( let s of students ) {
            //     let rec = recommendations.Prioritize(tutors, s, weights2);
            //     let top10 = rec.slice(0, 20);

            //     for(let t of top10){
            //         predictedTutors_rating.push(t);
            //     }
            // }

            // fs.writeFile('rating_data.json',JSON.stringify(predictedTutors_rating),function(err){
            //     if(err) throw err;
            // });
            // TODO: save the tutors and their scores to a CSV file or
            // something so we can calculate their effectiveness.   
        });
    });

});
