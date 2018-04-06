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
        for(let person of people){
            // For each person, we need to pull out their individual review score,
            // their overall review score, and their previous history to weight.
            let individualScore = GetIndividualScore(person, current_user);
            let overallScore = GetOverallScore(person);
            let previousInteractionScore = GetPreviousInteractionScore(person, current_user); 

            person[SCORE_ATTR] = CalculateWeightedAverage([
                individualScore,
                overallScore,
                previousInteractionScore], [
                    1, // Weight for individual scores
                    1, // Weight for overall scores
                    1  // Weight for previous interactions
                ]);
        }

        people = NormalizeAttribute(people, SCORE_ATTR); 

        people = SortPeopleByAttribute(people, SCORE_ATTR);

        return people;
        
    }catch (e){
        console.log("An exception occurred");
        console.log(e.message);
    }

}

function GetIndividualScore(person, current_user){
    // TODO: fix users ID thing
    var usersRatings = person.ratings.filter( function(rating){
        return rating.usersID == current_user.usersID;
    });

    var averageRating = usersRatings.map(function(rating){
        return rating.score;
    }).reduce(function(sum, current){
        return sum + current;
    });

    averageRating = averageRating / usersRatings.length;

    return averageRating;
}

function GetOverallScore(person){
    var d = new Date();
    d.setMonth(d.getMonth() -3);
    
    var scores = person.ratings.filter(function(rating){
        return rating.Date > d;
    });

    if(scores.length < 5){
        scores = person.ratings.slice(-5);
    }

    averageScore = scores.reduce(function(sum, a){
        sum += a;
    });

    return averageScore / scores.length;
}

function GetPreviousInteractionScore(person, current_user){
    throw {name : "NotImplementedError", message : "too lazy to implement"}; 
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

    let values = objects.map( function(i) {
        return i[attribute_to_normalize];
    });

    let min = Math.min(...values);
    let max = Math.max(...values);

    for(let thing of objects){
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
    SortPeopleByAttribute: SortPeopleByAttribute
};
