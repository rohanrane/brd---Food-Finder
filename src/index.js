'use strict';
var Alexa = require('alexa-app');
var skillService = new Alexa.app('foodFinder');
const AWS = require('aws-sdk');

var appId = 'amzn1.ask.skill.3fedbbd5-4dc5-49aa-a324-662fdd8f035a';

var req = require('superagent');

var googleapi = 'AIzaSyA-5tK376e77b7JBJkguMkzFig1Q572iQI';

var reprompt = "I didn't hear what you said could you repeat that.";
skillService.launch(function(request, response) {
  var prompt = 'Welcome to Food Finder';
  response.say(prompt).reprompt(reprompt).shouldEndSession(false);
});

var cancelIntentFunction = function(request, response) {
  response.say('Closing app. See you later!').shouldEndSession(true);
};

skillService.intent('AMAZON.CancelIntent',{}, cancelIntentFunction);
skillService.intent('AMAZON.StopIntent',{}, cancelIntentFunction);
skillService.intent('AMAZON.HelpIntent',{}, cancelIntentFunction);

skillService.intent('FinderIntent',{
  'slots':[{'RES': 'AMAZON.Language'}],
  'utterances': ['{Where should I go to eat}', '{-|RES}']
}, function(request, response){
	console.log('start');
	console.log(request);
	var userInput = request.slot('RES');
	if (userInput == 'yes') {
		response.shouldEndSession(true).send();
	}

	return req
	.post('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=37.5407,-77.4360&radius=16100&type=restaurant&key=AIzaSyA-5tK376e77b7JBJkguMkzFig1Q572iQI')
	.set('Content-Type', 'application/json')
	.then(res => {
		console.log(res.status);
		console.log(res.body);

		var numLoc = res.body.results.length;
		var index = Math.floor(Math.random() * numLoc);
		var name = res.body.results[index].name;
		var rating = res.body.results[index].rating;
		console.log(name);
		console.log(rating);

		if (res.status === 200) {
			response.say('How about ' + name + ' with a ' + rating + ' rating');
			response.shouldEndSession(false).send();
		}
    });
  }
);

module.exports = skillService;

