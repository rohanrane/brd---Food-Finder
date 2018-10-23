'use strict';
var Alexa = require('alexa-app');
var skillService = new Alexa.app('foodFinder');
const AWS = require('aws-sdk');

var appId = null;

var req = require('superagent');

var googleapi = null;

var distance = 16100;

var currentPlace;

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
	var userInput = request.slot('RES');
	if (userInput == 'yes') {
		console.log(currentPlace);
		response.say("I've sent the information to your phone");
		response.card({
  			type: "Simple",
  			title: currentPlace.name,
  			content: currentPlace.vicinity
		});
		response.shouldEndSession(true).send();
	}

	var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=37.5407,-77.4360&radius='
		.concat(distance).concat('&type=restaurant&key=').concat(googleapi);

	return req
	.post(url)
	.set('Content-Type', 'application/json')
	.then(res => {
		console.log(res.status);
		console.log(res.body);

		var numLoc = res.body.results.length;

		if (numLoc == 0) {
			response.say('No results found in area');
			response.shouldEndSession(false).send();
			return;
		}

		var index = Math.floor(Math.random() * numLoc);
		var name = res.body.results[index].name;
		var rating = res.body.results[index].rating;
		currentPlace = res.body.results[index];
		console.log(name);
		console.log(rating);

		if (res.status === 200) {
			response.say('How about ' + name + ' with a ' + rating + ' rating');
			response.shouldEndSession(false).send();
		}
    });
  }
);

skillService.intent('RadiusIntent',{
  'slots':{'DIST': 'AMAZON.NUMBER'},
  'utterances': ["{Set distance to } {DIST} {miles}"]
}, function(request, response){
	console.log('radius');
   	distance = 1609*request.slot('DIST');
   	response.say('Distance set to ' + request.slot('DIST') + ' miles').shouldEndSession(false);
  }
);

module.exports = skillService;

