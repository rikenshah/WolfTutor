require('dotenv').config();
const axios = require('axios');
const debug = require('debug')('slash-command-template:tutor');
const qs = require('querystring');
const MongoClient = require('mongodb').MongoClient;
const UserModel = require('../model/user');
var mongoStorage = require('botkit-storage-mongo')({mongoUri: process.env.MONGO_CONNECTION_STRING, tables: ['user','tutor','subject']});
var Botkit = require('botkit');
var controller = Botkit.slackbot({
    storage: mongoStorage,
});

const find = (slackUserId) => {
  const body = { token: process.env.SLACK_ACCESS_TOKEN, user: slackUserId };
  const promise = axios.post('https://slack.com/api/users.info', qs.stringify(body));
  return promise;
};

const SCORE_ATTR = 'weightedScore';

function Prioritize(people) {
    try{
        for(let person of people){
            // For each person, we need to pull out their individual review score, their overall review score, and their previous history to weight.
            let individualScore = GetIndividualScore(person);
            let overallScore = GetOverallScore(person);
            let previousInteractionScore = GetPreviousInteractionScore(person); 

            person[SCORE_ATTR] = CalculateWeightedAverage([individualScore, overallScore, previousInteractionScore], [1, 1, 1]);
        }

        people = NormalizeAttribute(people, SCORE_ATTR); 

        people = SortPeopleByAttribute(people, SCORE_ATTR);

        return people;
        
    }catch (e){
        console.log("An exception occurred");
        console.log(e.message);
    }

}

function GetIndividualScore(person){
    throw {name : "NotImplementedError", message : "too lazy to implement"}; 
}

function GetOverallScore(person){
    throw {name : "NotImplementedError", message : "too lazy to implement"}; 
}

function GetPreviousInteractionScore(person){
    throw {name : "NotImplementedError", message : "too lazy to implement"}; 
}

function CalculateWeightedAverage(scores, weights){
    let avg = 0;
    for(var i=0; i<scores.length; i++){
        avg += scores[i] * weights[i];
    }

    return (avg / scores.length);
}

function NormalizeAttribute(objects, attributeToNormalize){
    throw {name : "NotImplementedError", message : "too lazy to implement"}; 
}

function SortPeopleByAttribute(objects, attributeToNormalize){
    throw {name : "NotImplementedError", message : "too lazy to implement"}; 
}

module.exports = { Prioritize };
