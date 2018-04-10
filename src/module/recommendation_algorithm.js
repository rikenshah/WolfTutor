require('dotenv').config();
// const axios = require('axios');
// const debug = require('debug')('slash-command-template:tutor');
// const qs = require('querystring');
// const MongoClient = require('mongodb').MongoClient;
// const UserModel = require('../model/user');
// var mongoStorage = require('botkit-storage-mongo')({mongoUri: process.env.MONGO_CONNECTION_STRING, tables: ['user','tutor','subject']});
// var Botkit = require('botkit');
// var controller = Botkit.slackbot({
//     storage: mongoStorage,
// });
// 
// const find = (slackUserId) => {
//   const body = { token: process.env.SLACK_ACCESS_TOKEN, user: slackUserId };
//   const promise = axios.post('https://slack.com/api/users.info', qs.stringify(body));
//   return promise;
// };

const SCORE_ATTR = 'weightedScore';

function Prioritize(people, current_user) {
    try{
        // console.log("Pre re-ordering");
        // console.log(people);
        for(let person of people){
            // For each person, we need to pull out their individual review score,
            // their overall review score, and their previous history to weight.
            person.individualScore = GetIndividualScore(person, current_user);
            person.overallScore = GetOverallScore(person);
            person.previousInteractionScore = GetPreviousInteractionScore(person, current_user); 

            person[SCORE_ATTR] = CalculateWeightedAverage([
                _PenalizeScore(person.individualScore),
                _PenalizeScore(person.overallScore),
                _PenalizeScore(person.previousInteractionScore)], [
                    1, // Weight for individual scores
                    1, // Weight for overall scores
                    1  // Weight for previous interactions
                ]);
        }

        people = NormalizeAttribute(people, SCORE_ATTR); 

        people = SortPeopleByAttribute(people, SCORE_ATTR);

        // console.log("Post re-ordering");
        // console.log(people);

        return people;
        
    }catch (e){
        console.log("An exception occurred when attempting to prioritize tutors");
        console.log(e.message);
        console.log(e);

        return people;
    }

}

function _PenalizeScore(score){
    try {
        switch(score){
        case 0:
            return score;
            break;
        case 1:
            return score - 2;
            break;
        case 2:
        default:
            return score;
            break;
        }
    } catch(error) {
        console.log("An exception occurred when attempting to penalize poor tutors");
        console.log(e.message);
        console.log(e);

        return 0;
    }

}


function GetIndividualScore(person, current_user){
    try {
        var usersRatings = person.reviews.filter( function(rating){
            return rating.user_id == current_user.id;
        });

        if(usersRatings < 1)
            return 0;

        var averageRating = usersRatings.map(function(review){
            return review.rating;
        }).reduce(function(sum, current){
            return sum + current;
        });

        averageRating = averageRating / usersRatings.length;

        return averageRating;
    } catch(e) {
        console.log("an error occurred when calculating individual score");
        console.log(e.message);
        console.log(e);

        return 0;
    }

}

function GetOverallScore(person){
    try {
        var d = new Date();
        d.setMonth(d.getMonth() - 1);

        if(person.reviews.length < 1)
            return 0;

        // Get reviwes in the past month.
        var scores = person.reviews.filter(function(rating){
            return rating.date > d;
        });

        // If we have fewer than 5, just take the 5 most recent
        if(scores.length < 5){
            scores = person.reviews.slice(-5);
        }

        averageScore = scores.map(function(review) {
            return review.rating;
        }).reduce(function(sum, a){
            return sum + a;
        });

        return averageScore / scores.length;
    } catch(e) {
        console.log("an error occurred when calculating overall score");
        console.log(e.message);
        console.log(e);

        return 0;
    }

}

function GetPreviousInteractionScore(person, current_user){
    try {
        if(!current_user.reviews)
            return 0;
        let usersRatings = current_user.reviews.filter( function(rating){
            return rating.user_id == person.id;
        });

        if(usersRatings.length < 1)
            return 0;

        let ratings = usersRatings.map(function(review){
            return review.rating;
        })

        let averageRating = ratings.reduce(function(sum, current){
            return sum + current;
        });

        averageRating = averageRating / usersRatings.length;

        return averageRating;
    } catch(e) {
        console.log("an error occurred when calculating previous interaction score");
        console.log(e.message);
        console.log(e);

        return 0;
    }

}

function CalculateWeightedAverage(scores, weights){
    let avg = 0;
    for(var i=0; i<scores.length; i++){
        avg += scores[i] * weights[i];
    }

    return (avg / scores.length);
}

// Takes an array of objects and attemts to normalize the provided attribute
// To between zero and one.  Operates in place and returns a reference to objects.
function NormalizeAttribute(objects, attribute_to_normalize){

    let values = [];
    for(let i in objects){
        values.push(objects[i][attribute_to_normalize]);
    }

    let min = Math.min(...values);
    let max = Math.max(...values);

    for(let i in objects){
        let thing = objects[i];
        thing[attribute_to_normalize] = (thing[attribute_to_normalize] - min) / (max - min);
    }

    return objects;
}

// Sorts array of objects by the attribute provided.
// Attempts to sort from greatest to lowest.
function SortPeopleByAttribute(objects, attribute_to_sort){
    return objects.sort(function(a, b) {
        return b[attribute_to_sort] - a[attribute_to_sort];
    });
}

module.exports = {
    Prioritize: Prioritize,
    NormalizeAttribute: NormalizeAttribute,
    SortPeopleByAttribute: SortPeopleByAttribute,
    GetIndividualScore: GetIndividualScore,
    GetOverallScore: GetOverallScore
};
