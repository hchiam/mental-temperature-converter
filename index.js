/* eslint-disable require-jsdoc */

'use strict';

const {dialogflow} = require('actions-on-google');
const functions = require('firebase-functions');

const app = dialogflow({debug: true});

app.intent('toC', (conv) => {
  const input = conv.contexts.get('input').parameters;
  const number = input.number;
  const unit = input.unit;
  const stepAt = input.stepAt || 1;
  const toWhat = input.toWhat || 'c';
  const originalValue = number;
  const step1 = Math.round(number/2);
  const step2 = Math.round(step1 + step1/10);
  const step3 = step2 - 20;
  const step4 = step3 + 2;
  conv.contexts.set(
      'toc-followup',
      5,
      {
        number: number,
        unit: unit,
        stepAt: stepAt,
        toWhat: toWhat,
        originalValue: originalValue,
        step1: step1,
        step2: step2,
        step3: step3,
        step4: step4,
      }
  );

  const coin = Math.random();
  if (coin < 0.5) {
    conv.ask('I heard ' + number + ' degrees Fahrenheit. Step 1 to convert it to Celsius: What is half of ' + number + '? (To make things easier, round it.)');
  } else {
    conv.ask('I heard ' + number + ' degrees Fahrenheit. Step 1: What is half of ' + number + '? (To make things easier, round it.)');
  }
});

app.intent('toF', (conv) => {
  const input = conv.contexts.get('input').parameters;
  const number = input.number;
  const unit = input.unit;
  const stepAt = input.stepAt || 1;
  const toWhat = input.toWhat || 'f';
  const originalValue = number;
  const step1 = Math.round(number*2);
  const step2 = Math.round(step1 - step1/10);
  const step3 = step2 + 32;
  conv.contexts.set(
      'tof-followup',
      5,
      {
        number: number,
        unit: unit,
        stepAt: stepAt,
        toWhat: toWhat,
        originalValue: originalValue,
        step1: step1,
        step2: step2,
        step3: step3,
      }
  );

  const coin = Math.random();
  if (coin < 0.5) {
    conv.ask('I heard ' + number + ' degrees Celsius. Step 1 to convert it to Fahrenheit: What is ' + number + ' times 2?');
  } else {
    conv.ask('I heard ' + number + ' degrees Celsius. Step 1: What is double of ' + number + '?');
  }
});

app.intent('generateExample', (conv) => {
  const number = Math.floor((Math.random() * 100) + 1);
  let coin = Math.random();
  if (coin < 0.5) { // toF
    let step1 = Math.round(number*2);
    let step2 = Math.round(step1 - step1/10);
    let step3 = step2 + 32;
    conv.contexts.set(
        'tof-followup',
        5,
        {
          number: number,
          unit: 'c',
          stepAt: 1,
          toWhat: 'f',
          originalValue: number,
          step1: step1,
          step2: step2,
          step3: step3,
        }
    );
    coin = Math.random();
    if (coin < 0.5) {
      conv.ask('I heard ' + number + ' degrees Celsius. Step 1 to turn it into degrees Fahrenheit: What is ' + number + ' times 2?');
    } else {
      conv.ask('I heard ' + number + ' degrees Celsius. Step 1 to change it to Fahrenheit: What is ' + number + ' times 2?');
    }
  } else { // toC
    let step1 = Math.round(number/2);
    let step2 = Math.round(step1 + step1/10);
    let step3 = step2 - 20;
    let step4 = step3 + 2;
    conv.contexts.set(
        'toc-followup',
        5,
        {
          number: number,
          unit: 'c',
          stepAt: 1,
          toWhat: 'f',
          originalValue: number,
          step1: step1,
          step2: step2,
          step3: step3,
          step4: step4,
        }
    );
    coin = Math.random();
    if (coin < 0.5) {
      conv.ask('I heard ' + number + ' degrees Fahrenheit. The first step to change it to Celsius is to divide ' + number + ' by 2. What do you get? (To make things easier, round it.)');
    } else {
      conv.ask('I heard ' + number + ' degrees Fahrenheit. Let\'s start converting it to Celsius: What is ' + number + ' divided by 2? (To make things easier, round it.)');
    }
  }
});

app.intent('stepsC', (conv) => {
  // NOTE: toC-followup is lowercased to toc-followup
  const input = conv.contexts.get('toc-followup').parameters;
  const number = input.number;
  const originalValue = input.originalValue;
  const stepAt = input.stepAt || 1;
  const step1 = input.step1;
  const step2 = input.step2;
  const step3 = input.step3;
  const step4 = input.step4;

  if (stepAt === 1) {
    let targetValue = step1;
    if (number == targetValue) {
      setFollowupContext_toC(conv, input, stepAt + 1);
      conv.ask(praise() + 'Step 2: Move the decimal in ' + number + ' a place to the left. Round it. And add that to ' + number + '. What do you get? (You can guess.)');
    } else if (number > targetValue) {
      conv.ask('Go' + detectCloseness(number, targetValue) + ' lower' + hintAddOn() + 'What\'s ' + originalValue + ' divided by 2, rounded?');
    } else if (number < targetValue) {
      conv.ask('Go' + detectCloseness(number, targetValue) + ' higher' + hintAddOn() + 'What\'s ' + originalValue + ' divided by 2, rounded?');
    } else {
      conv.ask('What is the new number?');
    }
  } else if (stepAt === 2) {
    let targetValue = step2;
    if (number == targetValue) {
      setFollowupContext_toC(conv, input, stepAt + 1);
      conv.ask(praise() + 'Step 3: What is ' + number + ' minus 20?');
    } else if (number > targetValue) {
      conv.ask('Go' + detectCloseness(number, targetValue) + ' lower' + hintAddOn() + 'Take ' + step1 + ', and add to it ' + step1 + ' divided by 10. (And round it.)');
    } else if (number < targetValue) {
      conv.ask('Go' + detectCloseness(number, targetValue) + ' higher' + hintAddOn() + 'Take ' + step1 + ', and add to it ' + step1 + ' divided by 10. (And round it.)');
    } else {
      conv.ask('What is the new number?');
    }
  } else if (stepAt === 3) {
    let targetValue = step3;
    if (number == targetValue) {
      setFollowupContext_toC(conv, input, stepAt + 1);
      conv.ask(praise() + 'Step 4: What is ' + number + ' plus 2?');
    } else if (number > targetValue) {
      conv.ask('Go' + detectCloseness(number, targetValue) + ' lower' + hintAddOn() + 'What\'s ' + step2 + ' minus 20?');
    } else if (number < targetValue) {
      conv.ask('Go' + detectCloseness(number, targetValue) + ' higher' + hintAddOn() + 'What\'s ' + step2 + ' minus 20?');
    } else {
      conv.ask('What is the new number?');
    }
  } else if (stepAt === 4) {
    let targetValue = step4;
    if (number == targetValue) {
      setFollowupContext_toC(conv, input, 0);
      conv.close('<speak>You got it! ' + originalValue + ' Fahrenheit is about ' + number + ' Celsius. Thanks for trying Mental Temperature Converter! Remember: practice makes perfect.<audio src="https://actions.google.com/sounds/v1/weather/thunder_crack.ogg"></audio></speak>');
    } else if (number > targetValue) {
      conv.ask('Go' + detectCloseness(number, targetValue) + ' lower' + hintAddOn() + 'What\'s ' + step3 + ' plus 2?');
    } else if (number < targetValue) {
      conv.ask('Go' + detectCloseness(number, targetValue) + ' higher' + hintAddOn() + 'What\'s ' + step3 + ' plus 2?');
    } else {
      conv.ask('What is the new number?');
    }
  }
});

app.intent('stepsF', (conv) => {
  // NOTE: toF-followup is lowercased to tof-followup
  const input = conv.contexts.get('tof-followup').parameters;
  const number = input.number;
  const originalValue = input.originalValue;
  const stepAt = input.stepAt || 1;
  const step1 = input.step1;
  const step2 = input.step2;
  const step3 = input.step3;

  if (stepAt === 1) {
    let targetValue = step1;
    if (number == targetValue) {
      setFollowupContext_toF(conv, input, stepAt + 1);
      conv.ask(praise() + 'Step 2: Move the decimal in ' + number + ' a place to the left. Round it. And do ' + number + ' minus that number. What do you get? (You can guess.)');
    } else if (number > targetValue) {
      conv.ask('Go' + detectCloseness(number, targetValue) + ' lower' + hintAddOn() + 'What is ' + originalValue + ' times 2?');
    } else if (number < targetValue) {
      conv.ask('Go' + detectCloseness(number, targetValue) + ' higher' + hintAddOn() + 'What is ' + originalValue + ' times 2?');
    } else {
      conv.ask('What is the new number?');
    }
  } else if (stepAt === 2) {
    let targetValue = step2;
    if (number == targetValue) {
      setFollowupContext_toF(conv, input, stepAt + 1);
      conv.ask(praise() + 'Step 3: What is ' + number + ' plus 32?');
    } else if (number > targetValue) {
      conv.ask('Go' + detectCloseness(number, targetValue) + ' lower' + hintAddOn() + 'Take ' + step1 + ', and subtract from it ' + step1 + ' divided by 10. (And round it.)');
    } else if (number < targetValue) {
      conv.ask('Go' + detectCloseness(number, targetValue) + ' higher' + hintAddOn() + 'Take ' + step1 + ', and subtract from it ' + step1 + ' divided by 10. (And round it.)');
    } else {
      conv.ask('What is the new number?');
    }
  } else if (stepAt === 3) {
    let targetValue = step3;
    if (number == targetValue) {
      setFollowupContext_toF(conv, input, 0);
      conv.close('<speak>You got it! ' + originalValue + ' Celsius is about ' + number + ' Fahrenheit. Thanks for trying Mental Temperature Converter! Remember: practice makes perfect.<audio src="https://actions.google.com/sounds/v1/weather/thunder_crack.ogg"></audio></speak>');
    } else if (number > targetValue) {
      conv.ask('Go' + detectCloseness(number, targetValue) + ' lower' + hintAddOn() + 'What\'s ' + step2 + ' plus 32?');
    } else if (number < targetValue) {
      conv.ask('Go' + detectCloseness(number, targetValue) + ' higher' + hintAddOn() + 'What\'s ' + step2 + ' plus 32?');
    } else {
      conv.ask('What is the new number?');
    }
  }
});


exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);


function setFollowupContext_toC(conv, input, setStepAt) {
  const toWhat = input.toWhat || 'c';
  const contextName = 'toc-followup';
  setFollowupContext(conv, input, setStepAt, toWhat, contextName);
}


function setFollowupContext_toF(conv, input, setStepAt) {
  const toWhat = input.toWhat || 'f';
  const contextName = 'tof-followup';
  setFollowupContext(conv, input, setStepAt, toWhat, contextName);
}


function setFollowupContext(conv, input, setStepAt, toWhat, contextName) {
  const number = input.number;
  const unit = input.unit;
  const stepAt = setStepAt || input.stepAt || 1;
  const originalValue = input.originalValue;
  const step1 = input.step1;
  const step2 = input.step2;
  const step3 = input.step3;
  const parameters = {
    number: number,
    unit: unit,
    stepAt: stepAt,
    toWhat: toWhat,
    originalValue: originalValue,
    step1: step1,
    step2: step2,
    step3: step3,
  };
  if (contextName === 'toc-followup') {
    parameters.step4 = input.step4;
  }
  conv.contexts.set(
    contextName, // 'toc-followup' or 'tof-followup'
    5,
    parameters
);
}


// randomize end of hint sentences
function hintAddOn() {
  const coin = Math.random();
  if (coin < 0.5) {
    return '. ';
  } else {
    return ' than that. ';
  }
}


// detect closeness
function detectCloseness(number, targetValue) {
  if (Math.abs(number - targetValue) <= 5) {
    return ' a little';
  }
  return '';
}


// randomize positive feedback/confirmation
function praise() {
  const coin = Math.random();
  if (coin < 0.5) {
    return 'Correct! ';
  } else {
    return 'Yes! ';
  }
}
