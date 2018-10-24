// server.js
// where your node app starts

// imports
const express = require('express');
const ApiAiAssistant = require('actions-on-google').ApiAiAssistant;
const bodyParser = require('body-parser');
const request = require('request');
const Map = require('es6-map');
const prettyjson = require('prettyjson');

// will use Express.js for higher-level code
const app = express();

app.use(bodyParser.json({type: 'application/json'}));

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// Uncomment the below function to check the authenticity of the API.AI requests.
// See https://docs.api.ai/docs/webhook#section-authentication
/*app.post('/', function(req, res, next) {
  // Instantiate a new API.AI assistant object.
  const assistant = new ApiAiAssistant({request: req, response: res});
  
  // Throw an error if the request is not valid.
  if(assistant.isRequestFromApiAi(process.env.API_AI_SECRET_HEADER_KEY, 
                                  process.env.API_AI_SECRET_HEADER_VALUE)) {
    next();
  } else {
    console.log('Request failed validation - req.headers:', JSON.stringify(req.headers, null, 2));
    
    res.status(400).send('Invalid request');
  }
});*/

// Handle webhook requests
app.post('/', function(req, res, next) {
  // Log the request headers and body, to aid in debugging. You'll be able to view the
  // webhook requests coming from API.AI by clicking the Logs button the sidebar.
  logObject('Request headers: ', req.headers);
  logObject('Request body: ', req.body);
    
  // Instantiate a new API.AI assistant object.
  const assistant = new ApiAiAssistant({request: req, response: res});
  // assistant.tell(JSON.stringify(req.body))
  
  // Declare constants for your action and parameter names
  const CALCULATE_ACTION = req.body.result.action; // 'c.to.f'; // The action name from the API.AI intent
  const EXPRESSION_PARAMETER = 'number'; // An API.ai parameter name

  // Create functions to handle intents here
  function getCalculation(assistant) {
    console.log('Handling action: ' + CALCULATE_ACTION);
    let number = assistant.getArgument(EXPRESSION_PARAMETER);
    
    // let requestURL = "https://www.calcatraz.com/calculator/api?c=1000*" + encodeURIComponent(number);
    // request(requestURL, function(error, response) {
    //   if(error) {
    //     next(error);
    //   } else {
    //     let calculation = response.body;
    //     assistant.tell(calculation);
    //   }
    // });
    
    // just get value
    // assistant.tell(myCustomCode(CALCULATE_ACTION, number));
    
    // custom code
    myCustomCode(CALCULATE_ACTION, number, assistant);
  }
  
  // Add handler functions to the action router.
  let actionRouter = new Map();
  
  // The ASK_WEATHER_INTENT (askWeather) should map to the getWeather method.
  actionRouter.set(CALCULATE_ACTION, getCalculation); // actionRouter.set(ASK_WEATHER_ACTION, getWeather);
  
  // Route requests to the proper handler functions via the action router.
  assistant.handleRequest(actionRouter);
});

// Handle errors.
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

// Pretty print objects for logging.
function logObject(message, object, options) {
  console.log(message);
  console.log(prettyjson.render(object, options));
}

// Listen for requests.
let server = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + server.address().port);
});



// my custom code
function myCustomCode(actionName, number, assistant) {
  // check for invalid input:
  if (isNaN(number)) { // escape function early if not given a number
    assistant.ask('What is the new number?');
  }
  
  // if (actionName === 'c.to.f') return 'What is ' + number + ' times 2?';
  // if (actionName === 'c.to.f.step1') return 'Now what is ' + number + ' minus a tenth of ' + number + ' ?';
  // if (actionName === 'c.to.f.step2') return 'Now what is ' + number + ' plus 32 ?';
  // if (actionName === 'c.to.f.step3') return 'You have: ' + number;
  
  
  // assistant.data stores the data for use in the rest of the conversation, but you can still ask questions at each step
  if (actionName === 'toF') { // 'c.to.f') {
    const step1 = number*2;
    const step2 = Math.round(step1 - step1/10);
    const step3 = step2 + 32;
    assistant.data.originalValue = number;
    assistant.data.step1 = step1;
    assistant.data.step2 = step2;
    assistant.data.step3 = step3;
    // assistant.data.stepAt = 1;
    assistant.data.contextOut = {'stepAt' : 1, 'unit' : 'c'};
    let coin = Math.random();
    if (coin < 0.5) {
      assistant.ask('I heard ' + number + ' degrees Celsius. Step 1 to convert it to Fahrenheit: What is ' + number + ' times 2?');
    } else {
      assistant.ask('I heard ' + number + ' degrees Celsius. Step 1: What is double of ' + number + '?');
    }
  } else if (actionName === 'toC') {
    const step1 = Math.round(number/2);
    const step2 = Math.round(step1 + step1/10);
    const step3 = step2 - 20;
    const step4 = step3 + 2;
    assistant.data.originalValue = number;
    assistant.data.step1 = step1;
    assistant.data.step2 = step2;
    assistant.data.step3 = step3;
    assistant.data.step4 = step4;
    // assistant.data.stepAt = 1;
    assistant.data.contextOut = {'stepAt' : 1, 'unit' : 'f'};
    let coin = Math.random();
    if (coin < 0.5) {
      assistant.ask('I heard ' + number + ' degrees Fahrenheit. Step 1 to convert it to Celsius: What is half of ' + number + '? (To make things easier, round it.)');
    } else {
      assistant.ask('I heard ' + number + ' degrees Fahrenheit. Step 1: What is half of ' + number + '? (To make things easier, round it.)');
    }
  } else if (actionName === 'generate.example') {
    let number = Math.floor((Math.random() * 100) + 1);
    assistant.data.number = number;
    let coin = Math.random();
    if (coin < 0.5) {
      const step1 = number*2;
      const step2 = Math.round(step1 - step1/10);
      const step3 = step2 + 32;
      assistant.data.originalValue = number;
      assistant.data.step1 = step1;
      assistant.data.step2 = step2;
      assistant.data.step3 = step3;
      // assistant.data.stepAt = 1;
      assistant.data.contextOut = {'stepAt' : 1, 'unit' : 'c'};
      let coin = Math.random();
      if (coin < 0.5) {
        assistant.ask('I heard ' + number + ' degrees Celsius. Step 1 to turn it into degrees Fahrenheit: What is ' + number + ' times 2?');
      } else {
        assistant.ask('I heard ' + number + ' degrees Celsius. Step 1 to change it to Fahrenheit: What is ' + number + ' times 2?');
      }
    } else {
      const step1 = Math.round(number/2);
      const step2 = Math.round(step1 + step1/10);
      const step3 = step2 - 20;
      const step4 = step3 + 2;
      assistant.data.originalValue = number;
      assistant.data.step1 = step1;
      assistant.data.step2 = step2;
      assistant.data.step3 = step3;
      assistant.data.step4 = step4;
      // assistant.data.stepAt = 1;
      assistant.data.contextOut = {'stepAt' : 1, 'unit' : 'f'};
      let coin = Math.random();
      if (coin < 0.5) {
        assistant.ask('I heard ' + number + ' degrees Fahrenheit. The first step to change it to Celsius is to divide ' + number + ' by 2. What do you get? (To make things easier, round it.)');
      } else {
        assistant.ask('I heard ' + number + ' degrees Fahrenheit. Let\'s start converting it to Celsius: What is ' + number + ' divided by 2? (To make things easier, round it.)');
      }
    }
    
    
  } else if (assistant.data.contextOut.unit === 'c') { // c to f
    if (assistant.data.contextOut.stepAt === 1) {
      let targetValue = Number(assistant.data.step1);
      if (number == targetValue) {
        assistant.data.stepAt = 2;
        assistant.data.contextOut = {'stepAt' : 2, 'unit': 'c'};
        assistant.ask(praise() + 'Step 2: Move the decimal in ' + number + ' a place to the left. Round it. And do ' + number + ' minus that number. What do you get? (If you\'re stuck, just guess.)');
      } else if (number > targetValue) {
        assistant.ask('Go' + detectCloseness(number,targetValue) + ' lower' + hintAddOn() + 'What is ' + assistant.data.originalValue + ' times 2?');
      } else if (number < targetValue) {
        assistant.ask('Go' + detectCloseness(number,targetValue) + ' higher' + hintAddOn() + 'What is ' + assistant.data.originalValue + ' times 2?');
      } else {
        assistant.ask('What is the new number?');
      }
    } else if (assistant.data.contextOut.stepAt === 2) {
      let targetValue = Number(assistant.data.step2);
      if (number == targetValue) {
        assistant.data.stepAt = 3;
        assistant.data.contextOut = {'stepAt' : 3, 'unit': 'c'};
        assistant.ask(praise() + 'Step 3: What is ' + number + ' plus 32?');
      } else if (number > targetValue) {
        assistant.ask('Go' + detectCloseness(number,targetValue) + ' lower' + hintAddOn() + 'Take ' + assistant.data.step1 + ', and subtract from it ' + assistant.data.step1 + ' divided by 10. (And round it.)');
      } else if (number < targetValue) {
        assistant.ask('Go' + detectCloseness(number,targetValue) + ' higher' + hintAddOn() + 'Take ' + assistant.data.step1 + ', and subtract from it ' + assistant.data.step1 + ' divided by 10. (And round it.)');
      } else {
        assistant.ask('What is the new number?');
      }
    } else if (assistant.data.contextOut.stepAt === 3) {
      let originalValue = Number(assistant.data.originalValue);
      let targetValue = Number(assistant.data.step3);
      if (number == targetValue) {
        assistant.data.stepAt = 0;
        assistant.data.unit = '';
        assistant.data.contextOut = {'stepAt' : 0, 'unit' : ''};
        assistant.tell("You got it! " + originalValue + " Celsius is about " + number + " Fahrenheit. Thanks for trying Mental Temperature Converter! Remember: practice makes perfect.");
      } else if (number > targetValue) {
        assistant.ask('Go' + detectCloseness(number,targetValue) + ' lower' + hintAddOn() + 'What\'s ' + assistant.data.step2 + ' plus 32?');
      } else if (number < targetValue) {
        assistant.ask('Go' + detectCloseness(number,targetValue) + ' higher' + hintAddOn() + 'What\'s ' + assistant.data.step2 + ' plus 32?');
      } else {
        assistant.ask('What is the new number?');
      }
    }
    
    
  } else if (assistant.data.contextOut.unit === 'f') { // f to c
    if (assistant.data.contextOut.stepAt === 1) {
      let targetValue = Number(assistant.data.step1);
      if (number == targetValue) {
        // assistant.data.stepAt = 2;
        assistant.data.contextOut = {'stepAt' : 2, 'unit': 'f'};
        assistant.ask(praise() + 'Step 2: Move the decimal in ' + number + ' a place to the left. Round it. And add that to ' + number + '. What do you get? (If you\'re stuck, just guess.)');
      } else if (number > targetValue) {
        assistant.ask('Go' + detectCloseness(number,targetValue) + ' lower' + hintAddOn() + 'What\'s ' + assistant.data.originalValue + ' divided by 2, rounded?');
      } else if (number < targetValue) {
        assistant.ask('Go' + detectCloseness(number,targetValue) + ' higher' + hintAddOn() + 'What\'s ' + assistant.data.originalValue + ' divided by 2, rounded?');
      } else {
        assistant.ask('What is the new number?');
      }
    } else if (assistant.data.contextOut.stepAt === 2) {
      let targetValue = Number(assistant.data.step2);
      if (number == targetValue) {
        // assistant.data.stepAt = 3;
        assistant.data.contextOut = {'stepAt' : 3, 'unit': 'f'};
        assistant.ask(praise() + 'Step 3: What is ' + number + ' minus 20?');
      } else if (number > targetValue) {
        assistant.ask('Go' + detectCloseness(number,targetValue) + ' lower' + hintAddOn() + 'Take ' + assistant.data.step1 + ', and add to it ' + assistant.data.step1 + ' divided by 10. (And round it.)');
      } else if (number < targetValue) {
        assistant.ask('Go' + detectCloseness(number,targetValue) + ' higher' + hintAddOn() + 'Take ' + assistant.data.step1 + ', and add to it ' + assistant.data.step1 + ' divided by 10. (And round it.)');
      } else {
        assistant.ask('What is the new number?');
      }
    } else if (assistant.data.contextOut.stepAt === 3) {
      let targetValue = Number(assistant.data.step3);
      if (number == targetValue) {
        // assistant.data.stepAt = 4;
        assistant.data.contextOut = {'stepAt' : 4, 'unit': 'f'};
        assistant.ask(praise() + 'Step 4: What is ' + number + ' plus 2?');
      } else if (number > targetValue) {
        assistant.ask('Go' + detectCloseness(number,targetValue) + ' lower' + hintAddOn() + 'What\'s ' + assistant.data.step2 + ' minus 20?');
      } else if (number < targetValue) {
        assistant.ask('Go' + detectCloseness(number,targetValue) + ' higher' + hintAddOn() + 'What\'s ' + assistant.data.step2 + ' minus 20?');
      } else {
        assistant.ask('What is the new number?');
      }
    } else if (assistant.data.contextOut.stepAt === 4) {
      let originalValue = Number(assistant.data.originalValue);
      let targetValue = Number(assistant.data.step4);
      if (number == targetValue) {
        assistant.data.stepAt = 0;
        assistant.data.unit = '';
        assistant.data.contextOut = {'stepAt' : 0, 'unit' : ''};
        assistant.tell("You got it! " + originalValue + " Fahrenheit is about " + number + " Celsius. Thanks for trying Mental Temperature Converter! Remember: practice makes perfect.");
      } else if (number > targetValue) {
        assistant.ask('Go' + detectCloseness(number,targetValue) + ' lower' + hintAddOn() + 'What\'s ' + assistant.data.step3 + ' plus 2?');
      } else if (number < targetValue) {
        assistant.ask('Go' + detectCloseness(number,targetValue) + ' higher' + hintAddOn() + 'What\'s ' + assistant.data.step3 + ' plus 2?');
      } else {
        assistant.ask('What is the new number?');
      }
    }
  }
  
}


// randomize end of hint sentences
function hintAddOn() {
  let coin = Math.random();
  if (coin < 0.5) {
    return '. ';
  } else {
    return ' than that. ';
  }
}


// detect closeness
function detectCloseness(number,targetValue) {
  if (Math.abs(number - targetValue) <= 5) {
    return ' a little';
  }
  return '';
}


// randomize positive feedback/confirmation
function praise() {
  let coin = Math.random();
  if (coin < 0.5) {
    return 'Correct! ';
  } else {
    return 'Yes! ';
  }
}
