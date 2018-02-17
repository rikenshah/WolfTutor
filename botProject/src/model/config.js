require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_CONNECTION_STRING, function() { /* dummy function */ })
    .then(() => {
        console.log('Connection to DB Successful');
    })
    .catch(err => { // mongoose connection error will be handled here
        console.error('App starting error:', err.stack);
        process.exit(1);
    });
var schema = mongoose.Schema;

module.exports = {schema, mongoose}
