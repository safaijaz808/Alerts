/*
 * Helpers for various tasks
 *
 */

// Dependencies
//var config = require('./config');
var crypto = require('crypto');
const querystring = require('querystring');
var https = require('https');
var http = require("http");

// Container for all the helpers
var helpers = {};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function(str){
  try{
    var obj = JSON.parse(str);
    return obj;
  } catch(e){
    return {};
  }
};

// Create a SHA256 hash
helpers.hash = function(str){
  if(typeof(str) == 'string' && str.length > 0){
    var hash = crypto.createHmac('sha256', 'thisIsAlsoASecret').update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = function(strLength){
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength){
    // Define all the possible characters that could go into a string
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    var str = '';
    for(i = 1; i <= strLength; i++) {
        // Get a random charactert from the possibleCharacters string
        var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        // Append this character to the string
        str+=randomCharacter;
    }
    // Return the final string
    return str;
  } else {
    return false;
  }
};

 
helpers.sendTwilioSms = function(phone, msg, callback){
const accountSid = 'your_account_sid';
const authToken ='your_auth__number';
const client = require('twilio')(accountSid, authToken);

client.messages
  .create({
     body: msg,
     from: fromPhone,
     to: phone
   })
  .then(message => console.log(message.sid));
}


// Export the module
module.exports = helpers;
